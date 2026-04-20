using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Fitmart.API.Models;

public class ProductVariant
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProductId { get; set; }

    [ForeignKey(nameof(ProductId))]
    [JsonIgnore]
    public Product? Product { get; set; }

    [Required]
    public string Color { get; set; } = null!;

    [Required]
    public string Size { get; set; } = null!;

    [Required]
    public int StockQuantity { get; set; }

    public string? ImageUrl { get; set; }
}