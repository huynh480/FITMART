using Fitmart.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ChatController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/chat/rooms — Lấy danh sách phòng chat (Admin only).
    /// Sắp xếp theo tin nhắn mới nhất.
    /// </summary>
    [HttpGet("rooms")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetRooms()
    {
        var rooms = await _context.ChatRooms
            .OrderByDescending(r => r.LastMessageAt)
            .Select(r => new
            {
                r.Id,
                r.RoomId,
                r.CustomerName,
                r.LastMessage,
                lastMessageAt = r.LastMessageAt,
                r.UnreadCount,
                r.CreatedAt,
            })
            .ToListAsync();

        return Ok(rooms);
    }

    /// <summary>
    /// GET /api/chat/rooms/{roomId}/messages — Lấy lịch sử chat của 1 room.
    /// Trả về tối đa 100 tin nhắn gần nhất.
    /// </summary>
    [HttpGet("rooms/{roomId}/messages")]
    public async Task<IActionResult> GetMessages(string roomId)
    {
        var messages = await _context.ChatMessages
            .Where(m => m.RoomId == roomId)
            .OrderBy(m => m.Timestamp)
            .Take(100)
            .Select(m => new
            {
                m.Id,
                m.RoomId,
                m.SenderRole,
                m.SenderName,
                content = m.Content,
                m.Timestamp,
            })
            .ToListAsync();

        return Ok(messages);
    }

    /// <summary>
    /// PUT /api/chat/rooms/{roomId}/read — Đánh dấu đã đọc (reset unread).
    /// </summary>
    [HttpPut("rooms/{roomId}/read")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkAsRead(string roomId)
    {
        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.RoomId == roomId);
        if (room == null) return NotFound();

        room.UnreadCount = 0;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã đánh dấu đọc." });
    }
}
