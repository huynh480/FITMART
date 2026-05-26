using System.ComponentModel.DataAnnotations;

namespace Fitmart.API.Models;

/// <summary>
/// Tin nhắn chat — lưu toàn bộ lịch sử hội thoại.
/// </summary>
public class ChatMessage
{
    [Key]
    public int Id { get; set; }

    /// <summary>Mã phòng, liên kết với ChatRoom.RoomId</summary>
    [Required]
    [MaxLength(100)]
    public string RoomId { get; set; } = null!;

    /// <summary>"Customer" hoặc "Admin"</summary>
    [Required]
    [MaxLength(20)]
    public string SenderRole { get; set; } = null!;

    /// <summary>Tên người gửi hiển thị</summary>
    [Required]
    [MaxLength(100)]
    public string SenderName { get; set; } = null!;

    /// <summary>Nội dung tin nhắn</summary>
    [Required]
    public string Content { get; set; } = null!;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
