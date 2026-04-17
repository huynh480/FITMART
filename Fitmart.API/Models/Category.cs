using System.ComponentModel.DataAnnotations;

namespace Fitmart.API.Models;

public class Category
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }
}