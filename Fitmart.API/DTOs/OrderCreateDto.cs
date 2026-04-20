namespace Fitmart.API.DTOs;

public class OrderCreateDto
{
    // Thông tin khách hàng (ở mức cơ bản sử dụng UserId đã có trong hệ thống)
    public int UserId { get; set; }
    
    // Danh sách sản phẩm trong giỏ hàng
    public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}