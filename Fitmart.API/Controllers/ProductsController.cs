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
                .Include(p => p.ProductImages)  // Lấy kèm ảnh chi tiết
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
                .Include(p => p.ProductImages)  // Lấy kèm ảnh chi tiết
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
                .Include(p => p.ProductImages)  // Lấy kèm ảnh chi tiết
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
    // Nhận FormData gồm: thông tin chữ, ảnh chính (Image), nhiều ảnh chi tiết (DetailImageFiles)
    [HttpPost]
    public async Task<ActionResult<Product>> PostProduct([FromForm] ProductFormModel model)
    {
        try
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == model.CategoryId);
            if (!categoryExists)
                return BadRequest(new { message = "Danh mục không tồn tại." });

            // ── Xử lý ảnh chính (Image) ──
            string? imageUrl = null;
            if (model.Image != null && model.Image.Length > 0)
            {
                imageUrl = await SaveFileAsync(model.Image);
            }

            // ── Tạo Product ──
            var product = new Product
            {
                Name = model.Name,
                Price = model.Price,
                Description = model.Description,
                Gender = model.Gender,
                Collection = model.Collection,
                IsFeatured = model.IsFeatured,
                CategoryId = model.CategoryId
            };

            // Gán ảnh chính vào ProductVariant mặc định hoặc theo kích cỡ chọn
            if (!string.IsNullOrEmpty(model.Sizes))
            {
                var sizesList = model.Sizes.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();
                foreach (var size in sizesList)
                {
                    product.ProductVariants.Add(new ProductVariant
                    {
                        Color = "Default",
                        Size = size,
                        StockQuantity = 100,
                        ImageUrl = imageUrl
                    });
                }
            }
            else
            {
                product.ProductVariants.Add(new ProductVariant
                {
                    Color = "Default",
                    Size = "One Size",
                    StockQuantity = 100,
                    ImageUrl = imageUrl
                });
            }

            // ── Xử lý nhiều ảnh chi tiết (DetailImageFiles) ──
            if (model.DetailImageFiles != null && model.DetailImageFiles.Count > 0)
            {
                foreach (var detailFile in model.DetailImageFiles)
                {
                    if (detailFile.Length > 0)
                    {
                        var detailUrl = await SaveFileAsync(detailFile);
                        product.ProductImages.Add(new ProductImage
                        {
                            ImageUrl = detailUrl
                        });
                    }
                }
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Load lại product đầy đủ để trả về DTO
            var createdProduct = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductVariants)
                .Include(p => p.ProductImages)
                .FirstAsync(p => p.Id == product.Id);

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, MapToProductDto(createdProduct));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tạo sản phẩm mới.", error = ex.Message });
        }
    }

    // PUT: api/Products/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProduct(int id, [FromForm] ProductFormModel model)
    {
        if (id != model.Id)
            return BadRequest(new { message = "ID sản phẩm không hợp lệ." });

        try
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == model.CategoryId);
            if (!categoryExists)
                return BadRequest(new { message = "Danh mục không hợp lệ." });

            var product = await _context.Products
                .Include(p => p.ProductVariants)
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm." });

            // ── Cập nhật thông tin cơ bản ──
            product.Name = model.Name;
            product.Price = model.Price;
            product.Description = model.Description;
            product.Gender = model.Gender;
            product.Collection = model.Collection;
            product.IsFeatured = model.IsFeatured;
            product.CategoryId = model.CategoryId;

            // ── Cập nhật ảnh chính (nếu có file mới) ──
            if (model.Image != null && model.Image.Length > 0)
            {
                var imageUrl = await SaveFileAsync(model.Image);

                if (product.ProductVariants.Any())
                {
                    foreach (var variant in product.ProductVariants)
                    {
                        variant.ImageUrl = imageUrl;
                    }
                }
                else
                {
                    product.ProductVariants.Add(new ProductVariant
                    {
                        Color = "Default",
                        Size = "One Size",
                        StockQuantity = 100,
                        ImageUrl = imageUrl
                    });
                }
            }

            // ── Cập nhật danh sách size (ProductVariants) ──
            if (model.Sizes != null)
            {
                var sizesList = model.Sizes.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();
                
                // Xóa các variant cũ không còn nằm trong danh sách size mới
                var toRemove = product.ProductVariants.Where(v => !sizesList.Contains(v.Size)).ToList();
                foreach (var v in toRemove)
                {
                    _context.ProductVariants.Remove(v);
                }

                // Lấy ảnh chính hiện tại của sản phẩm để gán cho các variant mới
                var currentImageUrl = product.ProductVariants.FirstOrDefault()?.ImageUrl;

                // Thêm các variant cho size mới chưa tồn tại
                var existingSizes = product.ProductVariants.Select(v => v.Size).ToHashSet();
                foreach (var size in sizesList)
                {
                    if (!existingSizes.Contains(size))
                    {
                        product.ProductVariants.Add(new ProductVariant
                        {
                            Color = "Default",
                            Size = size,
                            StockQuantity = 100,
                            ImageUrl = currentImageUrl
                        });
                    }
                }
            }

            // ── Cập nhật ảnh chi tiết (nếu có file mới) ──
            if (model.DetailImageFiles != null && model.DetailImageFiles.Count > 0)
            {
                // Xóa tất cả ảnh chi tiết cũ trong DB
                _context.ProductImages.RemoveRange(product.ProductImages);

                // Thêm ảnh chi tiết mới
                foreach (var detailFile in model.DetailImageFiles)
                {
                    if (detailFile.Length > 0)
                    {
                        var detailUrl = await SaveFileAsync(detailFile);
                        product.ProductImages.Add(new ProductImage
                        {
                            ImageUrl = detailUrl
                        });
                    }
                }
            }

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

    // ══════════════════════════════════════════════════
    //  HELPER: Lưu file ảnh vào wwwroot/images/products/
    //  Trả về đường dẫn tương đối: /images/products/xxx.ext
    // ══════════════════════════════════════════════════
    private async Task<string> SaveFileAsync(IFormFile file)
    {
        var folder = Path.Combine(_env.WebRootPath, "images", "products");
        Directory.CreateDirectory(folder);

        var ext = Path.GetExtension(file.FileName).ToLower();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(folder, fileName);

        using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        return $"/images/products/{fileName}";
    }

    private bool ProductExists(int id) =>
        _context.Products.Any(e => e.Id == id);

    // ══════════════════════════════════════════════════
    //  HELPER: Map Product entity → ProductDto
    //  Bao gồm cả ProductImages (ảnh chi tiết)
    // ══════════════════════════════════════════════════
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
            }).ToList() ?? new List<ProductVariantDto>(),
            // Ảnh chi tiết sản phẩm
            ProductImages = p.ProductImages?.Select(pi => new ProductImageDto
            {
                Id = pi.Id,
                ImageUrl = pi.ImageUrl
            }).ToList() ?? new List<ProductImageDto>()
        };
    }
}

/// <summary>
/// Model nhận dữ liệu FormData từ Frontend
/// Gồm thông tin chữ, 1 file ảnh chính, và danh sách file ảnh chi tiết
/// </summary>
public class ProductFormModel
{
    public int? Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public string? Gender { get; set; }
    public string? Collection { get; set; }
    public bool IsFeatured { get; set; }
    public int CategoryId { get; set; }

    /// <summary>
    /// File ảnh chính (1 file duy nhất)
    /// </summary>
    public IFormFile? Image { get; set; }

    /// <summary>
    /// Danh sách file ảnh chi tiết (cho phép upload nhiều file cùng lúc)
    /// </summary>
    public List<IFormFile>? DetailImageFiles { get; set; }

    /// <summary>
    /// Danh sách kích cỡ của sản phẩm (chuỗi phân cách bởi dấu phẩy)
    /// </summary>
    public string? Sizes { get; set; }
}