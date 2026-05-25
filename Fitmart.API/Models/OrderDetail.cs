using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fitmart.API.Models;

public class OrderDetail
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OrderId { get; set; }

    [ForeignKey(nameof(OrderId))]
    public Order? Order { get; set; }

    [Required]
    public int ProductId { get; set; }

    [ForeignKey(nameof(ProductId))]
    public Product? Product { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [MaxLength(50)]
    public string Size { get; set; } = "M";

    [Required]
    [MaxLength(100)]
    public string Color { get; set; } = "Mặc định";

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }
}