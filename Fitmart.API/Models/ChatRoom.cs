using System.ComponentModel.DataAnnotations;

namespace Fitmart.API.Models;

/// <summary>
/// Phòng chat — mỗi khách hàng có 1 phòng riêng.
/// RoomId = "user_{userId}" hoặc "guest_{connectionId}" cho khách chưa đăng nhập.
/// </summary>
public class ChatRoom
{
    [Key]
    public int Id { get; set; }

    /// <summary>Mã phòng duy nhất, vd: "user_5" hoặc "guest_abc123"</summary>
    [Required]
    [MaxLength(100)]
    public string RoomId { get; set; } = null!;

    /// <summary>Tên khách hàng hiển thị</summary>
    [Required]
    [MaxLength(100)]
    public string CustomerName { get; set; } = null!;

    /// <summary>Tin nhắn cuối cùng (preview)</summary>
    [MaxLength(500)]
    public string? LastMessage { get; set; }

    /// <summary>Thời điểm tin nhắn cuối</summary>
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

    /// <summary>Số tin nhắn chưa đọc (phía Admin)</summary>
    public int UnreadCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
