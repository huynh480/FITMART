using Fitmart.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ══════════════════════════════════════════════
    // GET /api/dashboard/stats
    // Trả về tất cả thống kê cho trang Dashboard admin
    // ══════════════════════════════════════════════
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            // ── 1. Stat cards ──
            var totalRevenue = await _context.Orders
                .Where(o => o.Status.ToLower() == "completed")
                .SumAsync(o => o.TotalAmount);

            var totalOrders = await _context.Orders.CountAsync();

            var totalProducts = await _context.Products.CountAsync();

            var totalUsers = await _context.Users.CountAsync();

            // ── 2. Doanh thu 7 ngày gần nhất ──
            var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6); // hôm nay + 6 ngày trước = 7 ngày

            var revenueByDayRaw = await _context.Orders
                .Where(o => o.Status.ToLower() == "completed"
                         && o.OrderDate >= sevenDaysAgo)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            // Đảm bảo luôn có đủ 7 ngày (ngày không có đơn → revenue = 0)
            var revenueByDay = Enumerable.Range(0, 7)
                .Select(i =>
                {
                    var date = sevenDaysAgo.AddDays(i);
                    var found = revenueByDayRaw.FirstOrDefault(r => r.Date == date);
                    return new
                    {
                        day = date.ToString("dd/MM"),
                        revenue = found?.Revenue ?? 0m
                    };
                })
                .ToList();

            // ── 3. Top 5 sản phẩm bán chạy (theo tổng Quantity trong OrderDetails) ──
            var topProducts = await _context.OrderDetails
                .Include(od => od.Product)
                .GroupBy(od => new { od.ProductId, od.Product!.Name })
                .Select(g => new
                {
                    name = g.Key.Name,
                    sold = g.Sum(od => od.Quantity)
                })
                .OrderByDescending(x => x.sold)
                .Take(5)
                .ToListAsync();

            // ── 4. 5 đơn hàng mới nhất ──
            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .Select(o => new
                {
                    id = o.Id.ToString(),
                    customer = !string.IsNullOrWhiteSpace(o.CustomerName)
                        ? o.CustomerName
                        : (o.User != null ? o.User.FullName : "Khách vãng lai"),
                    total = o.TotalAmount,
                    status = o.Status.ToLower(),
                    date = o.OrderDate.ToString("dd/MM/yyyy")
                })
                .ToListAsync();

            return Ok(new
            {
                totalRevenue,
                totalOrders,
                totalProducts,
                totalUsers,
                revenueByDay,
                topProducts,
                recentOrders,
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Lỗi hệ thống khi tải thống kê dashboard.",
                error = ex.Message
            });
        }
    }
}
