using Fitmart.API.Data;
using Fitmart.API.Models;
using Fitmart.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<ActionResult> CreateOrder([FromBody] OrderCreateDto orderDto)
    {
        // 1. Kiểm tra giỏ hàng rỗng
        if (orderDto.Items == null || !orderDto.Items.Any())
        {
            return BadRequest(new { message = "Giỏ hàng của bạn đang trống." });
        }

        // Bắt đầu một Transaction để đảm bảo toàn vẹn dữ liệu
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            decimal totalAmount = 0;
            var orderDetails = new List<OrderDetail>();

            // 2. Tạo đối tượng Order trước để lấy Id sau này
            var newOrder = new Order
            {
                UserId = orderDto.UserId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                TotalAmount = 0 // Tạm thời để 0, tính xong sẽ cập nhật lại
            };

            // Lưu trước để sinh ID cho đơn hàng (Cần dùng cho OrderDetails)
            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync();

            // 3. Duyệt từng sản phẩm trong DTO, lấy giá từ DB để tính tổng an toàn (không tin tưởng giá từ client gửi lên)
            foreach (var item in orderDto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                {
                    return NotFound(new { message = $"Sản phẩm có ID {item.ProductId} không tồn tại." });
                }

                // Cộng dồn vào tổng tiền
                var itemTotal = product.Price * item.Quantity;
                totalAmount += itemTotal;

                // Tạo bản ghi chi tiết
                var orderDetail = new OrderDetail
                {
                    OrderId = newOrder.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                };
                
                orderDetails.Add(orderDetail);
            }

            // 4. Lưu danh sách OrderDetails vào DB
            _context.OrderDetails.AddRange(orderDetails);
            
            // 5. Cập nhật lại tổng giá trị thực tế của đơn hàng
            newOrder.TotalAmount = totalAmount;
            _context.Orders.Update(newOrder);
            
            await _context.SaveChangesAsync();
            
            // 6. Xác nhận Transaction thành công
            await transaction.CommitAsync();

            return Ok(new 
            { 
                message = "Tạo đơn hàng thành công!", 
                orderId = newOrder.Id,
                totalAmount = newOrder.TotalAmount
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Lỗi hệ thống khi xử lý đơn hàng.", error = ex.Message });
        }
    }
}