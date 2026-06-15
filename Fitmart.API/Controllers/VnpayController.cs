using Fitmart.API.Data;
using Fitmart.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Fitmart.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VnpayController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public VnpayController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpGet("return")]
    public async Task<IActionResult> Return()
    {
        var vnpay = new VnPayLibrary();
        
        foreach (var (key, value) in Request.Query)
        {
            if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
            {
                vnpay.AddResponseData(key, value.ToString());
            }
        }

        string vnp_SecureHash = Request.Query["vnp_SecureHash"].ToString();
        string hashSecret = _configuration["Vnpay:HashSecret"] ?? "";
        bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, hashSecret);

        if (checkSignature)
        {
            string vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            string orderIdStr = vnpay.GetResponseData("vnp_TxnRef");
            
            if (int.TryParse(orderIdStr, out int orderId))
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order != null)
                {
                    if (vnp_ResponseCode == "00")
                    {
                        order.Status = "Paid";
                    }
                    else
                    {
                        order.Status = "Failed";
                    }
                    _context.Orders.Update(order);
                    await _context.SaveChangesAsync();

                    return Ok(new { success = vnp_ResponseCode == "00", message = "Giao dịch xử lý thành công", orderId = order.Id });
                }
            }
        }

        return BadRequest(new { success = false, message = "Chữ ký không hợp lệ hoặc lỗi giao dịch." });
    }
}
