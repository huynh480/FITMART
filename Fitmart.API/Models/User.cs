using System.ComponentModel.DataAnnotations;

namespace Fitmart.API.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string FullName { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    /// <summary>BCrypt hash của mật khẩu — không bao giờ lưu plain text</summary>
    [Required]
    public string PasswordHash { get; set; } = null!;

    /// <summary>Customer | Admin</summary>
    [Required]
    public string Role { get; set; } = "Customer";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}