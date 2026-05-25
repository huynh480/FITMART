namespace Fitmart.API.DTOs;

public class OrderCreateDto
{
    // Thông tin khách hàng (ở mức cơ bản sử dụng UserId đã có trong hệ thống)
    public int UserId { get; set; }
    
    public string CustomerName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";
    public string PaymentMethod { get; set; } = "cod";
    
    // Danh sách sản phẩm trong giỏ hàng
    public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string Size { get; set; } = "M";
    public string Color { get; set; } = "Mặc định";
}