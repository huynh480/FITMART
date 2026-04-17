using Fitmart.API.Data;
using Fitmart.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace Fitmart.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OrdersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // POST: api/Orders
    [HttpPost]
    public async Task<ActionResult<Order>> PostOrder(Order order)
    {
        try
        {
            // Thiết lập mặc định thời gian đặt hàng (nếu chưa có)
            if (order.OrderDate == default)
            {
                order.OrderDate = DateTime.UtcNow;
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Trả về thông tin order vừa tạo cùng HTTP Status 201 Created
            return CreatedAtAction(nameof(PostOrder), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lưu đơn hàng.", error = ex.Message });
        }
    }
}