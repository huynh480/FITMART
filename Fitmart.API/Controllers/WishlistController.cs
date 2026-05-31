using System.Security.Claims;
using Fitmart.API.Data;
using Fitmart.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public WishlistController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy userId từ JWT claims.
    /// </summary>
    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                    ?? throw new UnauthorizedAccessException("Token không hợp lệ.");
        return int.Parse(claim.Value);
    }

    // ══════════════════════════════════════════════
    // GET /api/wishlist — Lấy danh sách sản phẩm yêu thích
    // ══════════════════════════════════════════════
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();

        var items = await _context.Wishlists
            .Where(w => w.UserId == userId)
            .Include(w => w.Product)
                .ThenInclude(p => p!.Category)
            .Include(w => w.Product)
                .ThenInclude(p => p!.ProductVariants)
            .Include(w => w.Product)
                .ThenInclude(p => p!.ProductImages)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new
            {
                wishlistId  = w.Id,
                createdAt   = w.CreatedAt,
                product = new
                {
                    id          = w.Product!.Id,
                    name        = w.Product.Name,
                    price       = w.Product.Price,
                    description = w.Product.Description,
                    gender      = w.Product.Gender,
                    collection  = w.Product.Collection,
                    isFeatured  = w.Product.IsFeatured,
                    categoryId  = w.Product.CategoryId,
                    category    = w.Product.Category == null ? null : new
                    {
                        id   = w.Product.Category.Id,
                        name = w.Product.Category.Name,
                        slug = w.Product.Category.Slug,
                    },
                    productVariants = w.Product.ProductVariants.Select(v => new
                    {
                        id       = v.Id,
                        size     = v.Size,
                        color    = v.Color,
                        imageUrl = v.ImageUrl,
                    }),
                    productImages = w.Product.ProductImages.Select(pi => new
                    {
                        id        = pi.Id,
                        imageUrl  = pi.ImageUrl,
                        colorName = pi.ColorName,
                    }),
                }
            })
            .ToListAsync();

        return Ok(items);
    }

    // ══════════════════════════════════════════════
    // GET /api/wishlist/ids — Lấy danh sách productId đã yêu thích
    // (Dùng để hiển thị tim đỏ nhanh trên ProductCard)
    // ══════════════════════════════════════════════
    [HttpGet("ids")]
    public async Task<IActionResult> GetIds()
    {
        var userId = GetUserId();

        var ids = await _context.Wishlists
            .Where(w => w.UserId == userId)
            .Select(w => w.ProductId)
            .ToListAsync();

        return Ok(ids);
    }

    // ══════════════════════════════════════════════
    // GET /api/wishlist/check/{productId} — Kiểm tra sản phẩm
    // ══════════════════════════════════════════════
    [HttpGet("check/{productId}")]
    public async Task<IActionResult> Check(int productId)
    {
        var userId = GetUserId();

        var exists = await _context.Wishlists
            .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

        return Ok(new { isWishlisted = exists });
    }

    // ══════════════════════════════════════════════
    // POST /api/wishlist/{productId} — Thêm sản phẩm vào yêu thích
    // ══════════════════════════════════════════════
    [HttpPost("{productId}")]
    public async Task<IActionResult> Add(int productId)
    {
        var userId = GetUserId();

        // Kiểm tra sản phẩm tồn tại
        var productExists = await _context.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
            return NotFound(new { message = "Sản phẩm không tồn tại." });

        // Kiểm tra đã yêu thích chưa
        var alreadyExists = await _context.Wishlists
            .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

        if (alreadyExists)
            return Ok(new { message = "Sản phẩm đã có trong danh sách yêu thích." });

        var wishlist = new Wishlist
        {
            UserId    = userId,
            ProductId = productId,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Wishlists.Add(wishlist);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã thêm vào yêu thích!", wishlistId = wishlist.Id });
    }

    // ══════════════════════════════════════════════
    // DELETE /api/wishlist/{productId} — Xóa sản phẩm khỏi yêu thích
    // ══════════════════════════════════════════════
    [HttpDelete("{productId}")]
    public async Task<IActionResult> Remove(int productId)
    {
        var userId = GetUserId();

        var item = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

        if (item == null)
            return NotFound(new { message = "Sản phẩm không có trong danh sách yêu thích." });

        _context.Wishlists.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã xóa khỏi yêu thích." });
    }
}
