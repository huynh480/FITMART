using Fitmart.API.Data;
using Fitmart.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        try
        {
            var products = await _context.Products
                .Include(p => p.Category) // Lấy kèm thông tin Category
                .ToListAsync();

            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách sản phẩm.", error = ex.Message });
        }
    }

    // GET: api/Products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm." });
            }

            return Ok(product);
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
            // Kiểm tra Category có tồn tại không
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Danh mục không tồn tại." });
            }

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
        {
            return BadRequest(new { message = "ID sản phẩm không hợp lệ." });
        }

        try
        {
            // Kiểm tra Category có tồn tại không
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Danh mục không hợp lệ." });
            }

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProductExists(id))
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm để cập nhật." });
            }
            throw;
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật sản phẩm.", error = ex.Message });
        }
    }

    // DELETE: api/Products/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm để xóa." });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi xóa sản phẩm.", error = ex.Message });
        }
    }

    private bool ProductExists(int id)
    {
        return _context.Products.Any(e => e.Id == id);
    }
}