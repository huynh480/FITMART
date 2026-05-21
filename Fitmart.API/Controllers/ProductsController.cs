using Fitmart.API.Data;
using Fitmart.API.DTOs;
using Fitmart.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ProductsController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // POST: api/Products/upload-image
    // Nhận file ảnh multipart/form-data, lưu vào wwwroot/images/products/
    // Trả về { "imageUrl": "/images/products/abc123.jpg" }
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không có file ảnh được gửi lên." });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Chỉ chấp nhận file ảnh (jpg, png, webp, gif)." });

        // Tạo thư mục nếu chưa có
        var folder = Path.Combine(_env.WebRootPath, "images", "products");
        Directory.CreateDirectory(folder);

        // Tên file: GUID + extension gốc (tránh trùng)
        var ext = Path.GetExtension(file.FileName).ToLower();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(folder, fileName);

        using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var imageUrl = $"/images/products/{fileName}";
        return Ok(new { imageUrl });
    }

    // GET: api/Products
    [HttpGet]
    public async Task<ActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? gender = null,
        [FromQuery] string? collection = null,
        [FromQuery] int? categoryId = null)
    {
        try
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductVariants)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);
            if (!string.IsNullOrEmpty(gender))
                query = query.Where(p => p.Gender == gender);
            if (!string.IsNullOrEmpty(collection))
                query = query.Where(p => p.Collection == collection);

            var totalItems = await query.CountAsync();

            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var productDtos = products.Select(p => MapToProductDto(p)).ToList();

            return Ok(new
            {
                totalItems,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                items = productDtos
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách sản phẩm.", error = ex.Message });
        }
    }

    // GET: api/Products/featured
    [HttpGet("featured")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetFeaturedProducts()
    {
        try
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductVariants)
                .Where(p => p.IsFeatured)
                .OrderByDescending(p => p.Id)
                .Take(8)
                .ToListAsync();

            var productDtos = products.Select(p => MapToProductDto(p)).ToList();
            return Ok(productDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách sản phẩm nổi bật.", error = ex.Message });
        }
    }

    // GET: api/Products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductVariants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm." });

            return Ok(MapToProductDto(product));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thông tin sản phẩm.", error = ex.Message });
        }
    }

    // POST: api/Products
    [HttpPost]
    public async Task<ActionResult<Product>> PostProduct(Product product)
    {
        try
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId);
            if (!categoryExists)
                return BadRequest(new { message = "Danh mục không tồn tại." });

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tạo sản phẩm mới.", error = ex.Message });
        }
    }

    // PUT: api/Products/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProduct(int id, Product product)
    {
        if (id != product.Id)
            return BadRequest(new { message = "ID sản phẩm không hợp lệ." });

        try
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId);
            if (!categoryExists)
                return BadRequest(new { message = "Danh mục không hợp lệ." });

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProductExists(id))
                return NotFound();
            throw;
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật sản phẩm.", error = ex.Message });
        }

        return NoContent();
    }

    // DELETE: api/Products/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi xóa sản phẩm.", error = ex.Message });
        }
    }

    private bool ProductExists(int id) =>
        _context.Products.Any(e => e.Id == id);

    private ProductDto MapToProductDto(Product p)
    {
        return new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            Description = p.Description,
            Gender = p.Gender,
            Collection = p.Collection,
            IsFeatured = p.IsFeatured,
            CategoryId = p.CategoryId,
            Category = p.Category != null ? new CategoryDto
            {
                Id          = p.Category.Id,
                Name        = p.Category.Name,
                Description = p.Category.Description,
                Slug        = p.Category.Slug,
                Gender      = p.Category.Gender,
                ParentId    = p.Category.ParentId,
            } : null,
            ProductVariants = p.ProductVariants?.Select(v => new ProductVariantDto
            {
                Id = v.Id,
                Color = v.Color,
                Size = v.Size,
                StockQuantity = v.StockQuantity,
                ImageUrl = v.ImageUrl
            }).ToList() ?? new List<ProductVariantDto>()
        };
    }
}