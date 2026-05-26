using Fitmart.API.Data;
using Fitmart.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Data;

/// <summary>
/// Seed tài khoản Admin mặc định vào DB nếu chưa tồn tại.
/// Chạy một lần duy nhất lúc khởi động server.
/// </summary>
public static class AdminSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Chỉ seed nếu chưa có admin nào trong DB
        var hasAdmin = await context.Users
            .AnyAsync(u => u.Role == "Admin");

        if (!hasAdmin)
        {
            context.Users.Add(new User
            {
                FullName     = "Admin FITMART",
                Email        = "admin@fitmart.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role         = "Admin",
                CreatedAt    = DateTime.UtcNow,
            });

            await context.SaveChangesAsync();
        }
    }
}
