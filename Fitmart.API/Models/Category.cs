using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fitmart.API.Models;

public class Category
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? Slug { get; set; }

    /// <summary>nam | nu | unisex</summary>
    public string? Gender { get; set; }

    /// <summary>ID danh mục cha (null = top-level)</summary>
    public int? ParentId { get; set; }

    [ForeignKey(nameof(ParentId))]
    public Category? Parent { get; set; }
}