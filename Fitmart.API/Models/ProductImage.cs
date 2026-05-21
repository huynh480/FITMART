using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Fitmart.API.Models;

/// <summary>
/// Ảnh chi tiết của sản phẩm (quan hệ 1-N với Product).
/// Khi xóa Product, tất cả ảnh chi tiết sẽ tự động bị xóa theo (Cascade Delete).
/// </summary>
public class ProductImage
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Đường dẫn tương đối đến file ảnh, ví dụ: "/images/products/abc123.webp"
    /// </summary>
    [Required]
    public string ImageUrl { get; set; } = null!;

    /// <summary>
    /// Khóa ngoại liên kết đến Product
    /// </summary>
    [Required]
    public int ProductId { get; set; }

    [ForeignKey(nameof(ProductId))]
    [JsonIgnore]
    public Product? Product { get; set; }
}
