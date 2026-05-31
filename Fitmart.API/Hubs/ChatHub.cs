using Fitmart.API.Data;
using Fitmart.API.Models;
using Fitmart.API.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Hubs;

/// <summary>
/// SignalR Hub xử lý chat real-time giữa Khách hàng và Admin.
/// Mỗi khách có 1 room riêng (roomId = "user_{id}" hoặc "guest_{connId}").
/// Admin join group "Admins" để nhận tất cả tin nhắn mới.
///
/// ── Hybrid Auto-Reply Bot ──
/// 1. Bắt từ khóa → phản hồi kịch bản (chào hỏi, size, ship...)
/// 2. Không khớp → fallback sang Google Gemini AI
/// </summary>
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private readonly ApplicationDbContext _context;
    private readonly GeminiService _geminiService;

    private const string BOT_NAME = "FITMART AI Bot";

    public ChatHub(ILogger<ChatHub> logger, ApplicationDbContext context, GeminiService geminiService)
    {
        _logger = logger;
        _context = context;
        _geminiService = geminiService;
    }

    // ═══════════════════════════════════════════════
    // Keyword → Canned Response Map
    // ═══════════════════════════════════════════════
    private static readonly (string[] keywords, string response)[] _keywordRules =
    [
        // Chào hỏi
        (["hi", "hello", "chào", "shop ơi", "xin chào", "alo", "hey"],
         "Chào bạn! 👋 Chào mừng đến FITMART — cửa hàng đồ tập gym & yoga cao cấp! Mình có thể giúp gì cho bạn hôm nay? 💪"),

        // Size / Kích cỡ
        (["size", "kích cỡ", "kích thước", "cỡ nào", "bảng size", "chọn size"],
         "Để tư vấn size chính xác, bạn cho mình biết chiều cao và cân nặng nhé! 📏 FITMART có đầy đủ từ S đến XXL, cam kết đổi trả nếu không vừa. 🔄"),

        // Ship / Vận chuyển
        (["ship", "phí ship", "giao hàng", "vận chuyển", "freeship", "miễn phí ship"],
         "FITMART hỗ trợ FREESHIP cho đơn hàng từ 500.000đ trở lên! 🚚 Đơn dưới 500k phí ship chỉ 30.000đ. Giao hàng toàn quốc 2-4 ngày. ⚡"),

        // Giá cả
        (["giá", "bao nhiêu", "giá bao nhiêu", "price", "khuyến mãi", "giảm giá", "sale"],
         "Sản phẩm FITMART có giá từ 199.000đ - 899.000đ! 🏷️ Bạn xem bộ sưu tập mới nhất tại trang Collections nhé. Thường xuyên có Flash Sale cực sốc! 🔥"),

        // Thanh toán
        (["thanh toán", "payment", "trả tiền", "cod", "chuyển khoản"],
         "FITMART hỗ trợ thanh toán COD (nhận hàng trả tiền) và chuyển khoản ngân hàng! 💳 Bạn chọn phương thức nào cũng được nhé. 🛒"),

        // Đổi trả
        (["đổi trả", "hoàn tiền", "return", "đổi hàng", "trả hàng"],
         "FITMART hỗ trợ đổi trả trong 7 ngày nếu sản phẩm còn nguyên tem mác! 🔄 Bạn liên hệ mình để được hướng dẫn chi tiết nhé. ✅"),

        // Cảm ơn
        (["cảm ơn", "thank", "thanks", "tks", "cám ơn"],
         "Không có gì ạ! 😊 Cảm ơn bạn đã tin tưởng FITMART. Chúc bạn tập luyện vui vẻ! 💪🔥"),
    ];

    /// <summary>
    /// Khách hàng gửi tin nhắn. Tin nhắn được:
    /// 1. Lưu vào DB
    /// 2. Gửi tới room + echo + notify Admins
    /// 3. Bot tự động phản hồi (keyword hoặc Gemini AI)
    /// </summary>
    public async Task SendMessageToAdmin(string roomId, string senderName, string message)
    {
        _logger.LogInformation("📩 [{Sender}] (room: {Room}) gửi: {Message}", senderName, roomId, message);

        var now = DateTime.UtcNow;

        // ── Lưu tin nhắn khách vào DB ──
        var chatMsg = new ChatMessage
        {
            RoomId     = roomId,
            SenderRole = "Customer",
            SenderName = senderName,
            Content    = message,
            Timestamp  = now,
        };
        _context.ChatMessages.Add(chatMsg);

        // Upsert ChatRoom
        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.RoomId == roomId);
        if (room == null)
        {
            room = new ChatRoom
            {
                RoomId        = roomId,
                CustomerName  = senderName,
                LastMessage   = message,
                LastMessageAt = now,
                UnreadCount   = 1,
                CreatedAt     = now,
            };
            _context.ChatRooms.Add(room);
        }
        else
        {
            room.LastMessage   = message;
            room.LastMessageAt = now;
            room.UnreadCount  += 1;
        }

        await _context.SaveChangesAsync();

        // ── Gửi tin nhắn tới room (Admin đang xem room này sẽ thấy) ──
        await Clients.Group($"room_{roomId}").SendAsync("ReceiveMessage", new
        {
            roomId,
            senderName,
            senderRole = "Customer",
            content    = message,
            timestamp  = now,
        });

        // ── Echo lại cho người gửi ──
        await Clients.Caller.SendAsync("ReceiveMessage", new
        {
            roomId,
            senderName,
            senderRole = "Customer",
            content    = message,
            timestamp  = now,
        });

        // ── Notify tất cả Admin ──
        await Clients.Group("Admins").SendAsync("NewMessageNotification", new
        {
            roomId,
            customerName = senderName,
            lastMessage  = message,
            timestamp    = now,
            unreadCount  = room.UnreadCount,
        });

        // ══════════════════════════════════════════
        // 🤖 HYBRID AUTO-REPLY BOT
        // ══════════════════════════════════════════
        try
        {
            string botReply;
            var msgLower = message.ToLower().Trim();

            // ── Bước 1: Kiểm tra từ khóa ──
            var matched = MatchKeyword(msgLower);

            if (matched != null)
            {
                await Task.Delay(1000); // Đợi 1s cho tự nhiên
                botReply = matched;
                _logger.LogInformation("🏷️ Bot keyword match → reply to room {Room}", roomId);
            }
            else
            {
                // ── Bước 2: Fallback sang Gemini AI (kèm dữ liệu sản phẩm thực) ──
                _logger.LogInformation("🤖 No keyword match → calling Gemini AI for room {Room}", roomId);
                await Task.Delay(500);

                // Query danh sách sản phẩm từ DB để AI tư vấn chuẩn xác
                var products = await _context.Products
                    .Include(p => p.Category)
                    .Select(p => new { p.Name, p.Price, Category = p.Category != null ? p.Category.Name : "" })
                    .ToListAsync();

                var productContext = string.Join("\n", products.Select(p =>
                    $"- {p.Name} ({p.Category}): {p.Price:N0}đ"));

                botReply = await _geminiService.GetAIReplyAsync(message, productContext);
            }

            // ── Gửi phản hồi bot ──
            await SendBotMessage(roomId, botReply, DateTime.UtcNow);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Bot auto-reply failed for room {Room}", roomId);
        }
    }

    /// <summary>
    /// Gửi tin nhắn bot tới room + lưu DB.
    /// </summary>
    private async Task SendBotMessage(string roomId, string content, DateTime timestamp)
    {
        // ── Lưu vào DB ──
        var botMsg = new ChatMessage
        {
            RoomId     = roomId,
            SenderRole = "Bot",
            SenderName = BOT_NAME,
            Content    = content,
            Timestamp  = timestamp,
        };
        _context.ChatMessages.Add(botMsg);

        // Cập nhật room preview
        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.RoomId == roomId);
        if (room != null)
        {
            room.LastMessage   = $"🤖 {content}";
            room.LastMessageAt = timestamp;
        }

        await _context.SaveChangesAsync();

        // ── Gửi tới room (khách + admin đang xem sẽ thấy) ──
        await Clients.Group($"room_{roomId}").SendAsync("ReceiveMessage", new
        {
            roomId,
            senderName = BOT_NAME,
            senderRole = "Bot",
            content,
            timestamp,
        });

        // ── Notify Admins ──
        await Clients.Group("Admins").SendAsync("NewMessageNotification", new
        {
            roomId,
            customerName = BOT_NAME,
            lastMessage  = $"🤖 {content}",
            timestamp,
            unreadCount  = 0,
        });
    }

    /// <summary>
    /// Kiểm tra từ khóa trong tin nhắn khách.
    /// Trả về phản hồi kịch bản nếu khớp, null nếu không.
    /// </summary>
    private static string? MatchKeyword(string messageLower)
    {
        foreach (var (keywords, response) in _keywordRules)
        {
            foreach (var kw in keywords)
            {
                if (messageLower.Contains(kw, StringComparison.OrdinalIgnoreCase))
                    return response;
            }
        }
        return null;
    }

    /// <summary>
    /// Admin trả lời tin nhắn trong 1 room cụ thể.
    /// </summary>
    public async Task SendMessageToCustomer(string roomId, string senderName, string message)
    {
        _logger.LogInformation("📩 Admin [{Sender}] → room [{Room}]: {Message}", senderName, roomId, message);

        var now = DateTime.UtcNow;

        // ── Lưu vào DB ──
        var chatMsg = new ChatMessage
        {
            RoomId     = roomId,
            SenderRole = "Admin",
            SenderName = senderName,
            Content    = message,
            Timestamp  = now,
        };
        _context.ChatMessages.Add(chatMsg);

        // Cập nhật room
        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.RoomId == roomId);
        if (room != null)
        {
            room.LastMessage   = message;
            room.LastMessageAt = now;
        }

        await _context.SaveChangesAsync();

        // ── Gửi tới room (cả khách trong room sẽ thấy) ──
        await Clients.Group($"room_{roomId}").SendAsync("ReceiveMessage", new
        {
            roomId,
            senderName,
            senderRole = "Admin",
            content    = message,
            timestamp  = now,
        });
    }

    /// <summary>
    /// Khách hàng join room của mình để nhận tin nhắn reply từ Admin.
    /// </summary>
    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"room_{roomId}");
        _logger.LogInformation("🔗 Client [{Conn}] joined room_{Room}", Context.ConnectionId, roomId);
    }

    /// <summary>
    /// Admin join group "Admins" để nhận notifications.
    /// </summary>
    public async Task JoinAdminGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        _logger.LogInformation("🔔 Admin [{ConnectionId}] đã join group Admins", Context.ConnectionId);
    }

    /// <summary>
    /// Admin join 1 room cụ thể để xem và reply tin nhắn.
    /// Đồng thời reset unread count.
    /// </summary>
    public async Task AdminJoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"room_{roomId}");

        // Reset unread count
        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.RoomId == roomId);
        if (room != null)
        {
            room.UnreadCount = 0;
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("🔔 Admin [{Conn}] joined room_{Room}", Context.ConnectionId, roomId);
    }

    /// <summary>
    /// Admin rời 1 room (khi chuyển sang xem room khác).
    /// </summary>
    public async Task AdminLeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"room_{roomId}");
        _logger.LogInformation("👋 Admin [{Conn}] left room_{Room}", Context.ConnectionId, roomId);
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("✅ Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("❌ Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
