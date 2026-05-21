namespace Fitmart.API.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public string? Gender { get; set; }
    public string? Collection { get; set; }
    public bool IsFeatured { get; set; }
    public int CategoryId { get; set; }
    
    public CategoryDto? Category { get; set; }
    public List<ProductVariantDto> ProductVariants { get; set; } = new();

    /// <summary>
    /// Danh sách ảnh chi tiết của sản phẩm
    /// </summary>
    public List<ProductImageDto> ProductImages { get; set; } = new();
}

public class ProductVariantDto
{
    public int Id { get; set; }
    public string Color { get; set; } = null!;
    public string Size { get; set; } = null!;
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
}

/// <summary>
/// DTO cho ảnh chi tiết sản phẩm
/// </summary>
public class ProductImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = null!;
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Slug { get; set; }
    public string? Gender { get; set; }
    public int? ParentId { get; set; }
}