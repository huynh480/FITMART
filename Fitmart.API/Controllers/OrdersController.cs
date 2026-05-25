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
                CustomerName = string.IsNullOrWhiteSpace(orderDto.CustomerName) ? "Khách vãng lai" : orderDto.CustomerName,
                Phone = string.IsNullOrWhiteSpace(orderDto.Phone) ? "" : orderDto.Phone,
                Address = string.IsNullOrWhiteSpace(orderDto.Address) ? "" : orderDto.Address,
                PaymentMethod = string.IsNullOrWhiteSpace(orderDto.PaymentMethod) ? "cod" : orderDto.PaymentMethod,
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
                    UnitPrice = product.Price,
                    Size = string.IsNullOrWhiteSpace(item.Size) ? "M" : item.Size,
                    Color = string.IsNullOrWhiteSpace(item.Color) ? "Mặc định" : item.Color
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

    // GET: api/Orders
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetOrders()
    {
        try
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var orderIds = orders.Select(o => o.Id).ToList();

            var allDetails = await _context.OrderDetails
                .Include(od => od.Product)
                    .ThenInclude(p => p.ProductImages)
                .Where(od => orderIds.Contains(od.OrderId))
                .ToListAsync();

            var result = orders.Select(o => {
                var items = allDetails
                    .Where(od => od.OrderId == o.Id)
                    .Select(od => new
                    {
                        name = od.Product?.Name ?? "Sản phẩm không rõ",
                        image = od.Product?.ProductImages?.FirstOrDefault()?.ImageUrl ?? "",
                        size = od.Size ?? "M",
                        color = od.Color ?? "Mặc định",
                        qty = od.Quantity,
                        price = od.UnitPrice
                    }).ToList();

                return new
                {
                    id = o.Id.ToString(),
                    customer = !string.IsNullOrWhiteSpace(o.CustomerName) ? o.CustomerName : (o.User?.FullName ?? "Khách vãng lai"),
                    email = o.User?.Email ?? "customer@fitmart.vn",
                    phone = o.Phone ?? "",
                    address = !string.IsNullOrWhiteSpace(o.Address) ? o.Address : "123 Đường Láng, Đống Đa, Hà Nội",
                    paymentMethod = o.PaymentMethod ?? "cod",
                    items = items,
                    subtotal = o.TotalAmount,
                    shipping = o.TotalAmount >= 500000 ? 0 : 30000,
                    total = o.TotalAmount + (o.TotalAmount >= 500000 ? 0 : 30000),
                    status = o.Status.ToLower(),
                    date = DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc).ToLocalTime().ToString("dd/MM/yyyy HH:mm")
                };
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi lấy danh sách đơn hàng.", error = ex.Message });
        }
    }

    // GET: api/Orders/my-orders
    [HttpGet("my-orders")]
    public async Task<ActionResult<IEnumerable<object>>> GetMyOrders([FromQuery] int userId)
    {
        try
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var orderIds = orders.Select(o => o.Id).ToList();

            var allDetails = await _context.OrderDetails
                .Include(od => od.Product)
                    .ThenInclude(p => p.ProductImages)
                .Where(od => orderIds.Contains(od.OrderId))
                .ToListAsync();

            var result = orders.Select(o => {
                var items = allDetails
                    .Where(od => od.OrderId == o.Id)
                    .Select(od => new
                    {
                        name = od.Product?.Name ?? "Sản phẩm không rõ",
                        image = od.Product?.ProductImages?.FirstOrDefault()?.ImageUrl ?? "",
                        size = od.Size ?? "M",
                        color = od.Color ?? "Mặc định",
                        qty = od.Quantity,
                        price = od.UnitPrice
                    }).ToList();

                return new
                {
                    id = o.Id.ToString(),
                    customer = !string.IsNullOrWhiteSpace(o.CustomerName) ? o.CustomerName : (o.User?.FullName ?? "Khách vãng lai"),
                    email = o.User?.Email ?? "customer@fitmart.vn",
                    phone = o.Phone ?? "",
                    address = !string.IsNullOrWhiteSpace(o.Address) ? o.Address : "123 Đường Láng, Đống Đa, Hà Nội",
                    paymentMethod = o.PaymentMethod ?? "cod",
                    items = items,
                    subtotal = o.TotalAmount,
                    shipping = o.TotalAmount >= 500000 ? 0 : 30000,
                    total = o.TotalAmount + (o.TotalAmount >= 500000 ? 0 : 30000),
                    status = o.Status.ToLower(),
                    date = DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc).ToLocalTime().ToString("dd/MM/yyyy HH:mm")
                };
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi lấy danh sách đơn hàng của tôi.", error = ex.Message });
        }
    }


    // PUT: api/Orders/{id}/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto dto)
    {
        try
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound(new { message = $"Đơn hàng {id} không tồn tại." });
            }

            string rawStatus = dto.Status ?? "";
            string newStatus = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(rawStatus.ToLower());
            
            order.Status = newStatus;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                message = "Cập nhật trạng thái thành công!", 
                orderId = order.Id,
                status = order.Status.ToLower() 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi cập nhật trạng thái đơn hàng.", error = ex.Message });
        }
    }
}

public class OrderStatusUpdateDto
{
    public string Status { get; set; } = "";
}