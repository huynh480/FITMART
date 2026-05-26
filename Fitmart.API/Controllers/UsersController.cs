using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Fitmart.API.Data;
using Fitmart.API.DTOs;
using Fitmart.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Fitmart.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;

    public UsersController(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config  = config;
    }

    // ══════════════════════════════════════════════
    // POST /api/users/register
    // ══════════════════════════════════════════════
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName) ||
            string.IsNullOrWhiteSpace(dto.Email)    ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Vui lòng điền đầy đủ thông tin." });
        }

        // Kiểm tra email đã tồn tại chưa
        var exists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (exists)
            return Conflict(new { message = "Email này đã được đăng ký. Vui lòng dùng email khác." });

        // Validate độ dài mật khẩu
        if (dto.Password.Length < 6)
            return BadRequest(new { message = "Mật khẩu phải có ít nhất 6 ký tự." });

        var user = new User
        {
            FullName     = dto.FullName.Trim(),
            Email        = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role         = "Customer",
            CreatedAt    = DateTime.UtcNow,
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwt(user);

        return Ok(new AuthResponseDto
        {
            Token  = token,
            UserId = user.Id,
            Name   = user.FullName,
            Email  = user.Email,
            Role   = user.Role,
        });
    }

    // ══════════════════════════════════════════════
    // POST /api/users/login
    // ══════════════════════════════════════════════
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Vui lòng nhập email và mật khẩu." });

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower());

        if (user == null)
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });

        bool passwordValid = false;
        try
        {
            passwordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Fallback cho tài khoản cũ chưa được hash bằng BCrypt
            passwordValid = (dto.Password == user.PasswordHash);
        }

        if (!passwordValid)
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });

        var token = GenerateJwt(user);

        return Ok(new AuthResponseDto
        {
            Token  = token,
            UserId = user.Id,
            Name   = user.FullName,
            Email  = user.Email,
            Role   = user.Role,
        });
    }

    // ══════════════════════════════════════════════
    // GET /api/users  (Admin only — dùng cho UsersPage)
    // ══════════════════════════════════════════════
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                id        = u.Id,
                name      = u.FullName,
                email     = u.Email,
                role      = u.Role.ToLower(),
                createdAt = u.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy"),
                active    = true, // Mở rộng sau nếu cần trường IsActive
            })
            .ToListAsync();

        return Ok(users);
    }

    // ══════════════════════════════════════════════
    // PUT /api/users/{id}/role  (Admin only)
    // ══════════════════════════════════════════════
    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });

        user.Role = dto.Role ?? user.Role;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã cập nhật role!", id = user.Id, role = user.Role.ToLower() });
    }

    // ══════════════════════════════════════════════
    // Helper — Tạo JWT token
    // ══════════════════════════════════════════════
    private string GenerateJwt(User user)
    {
        var secret   = _config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret chưa được cấu hình.");
        var issuer   = _config["Jwt:Issuer"]   ?? "https://fitmart.vn";
        var audience = _config["Jwt:Audience"] ?? "https://fitmart.vn";
        var expiryDays = int.TryParse(_config["Jwt:ExpiryDays"], out var d) ? d : 7;

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name,  user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role,  user.Role),
        };

        var jwt = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}

// ── DTO inline nhỏ ──
public class UpdateRoleDto { public string? Role { get; set; } }
