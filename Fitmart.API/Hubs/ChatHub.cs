using Microsoft.AspNetCore.SignalR;

namespace Fitmart.API.Hubs;

/// <summary>
/// SignalR Hub xử lý chat real-time giữa Khách hàng và Admin.
/// - Khách gửi tin → broadcast tới group "Admins"
/// - Admin join group "Admins" để lắng nghe
/// </summary>
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Khách hàng gửi tin nhắn lên cho Admin.
    /// Tin nhắn được broadcast tới tất cả client trong group "Admins"
    /// và echo lại cho người gửi để hiển thị.
    /// </summary>
    public async Task SendMessageToAdmin(string user, string message)
    {
        _logger.LogInformation("📩 [{User}] gửi: {Message}", user, message);

        // Broadcast tới tất cả Admin đang lắng nghe
        await Clients.Group("Admins").SendAsync("ReceiveMessage", user, message);

        // Echo lại cho người gửi (để confirm tin nhắn đã gửi)
        await Clients.Caller.SendAsync("ReceiveMessage", user, message);
    }

    /// <summary>
    /// Admin gọi method này để join group "Admins" lắng nghe tin nhắn.
    /// (Chuẩn bị cho Phase 2 — Admin Chat UI)
    /// </summary>
    public async Task JoinAdminGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        _logger.LogInformation("🔔 Admin [{ConnectionId}] đã join group Admins", Context.ConnectionId);
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
