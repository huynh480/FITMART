using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fitmart.API.Models;

public class Product
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    public string? Description { get; set; }

    public string? Gender { get; set; }

    public string? Collection { get; set; }

    public bool IsFeatured { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category? Category { get; set; }

    public ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();

    /// <summary>
    /// Danh sách ảnh chi tiết của sản phẩm (quan hệ 1-N)
    /// </summary>
    public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
}