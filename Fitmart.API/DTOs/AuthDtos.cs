namespace Fitmart.API.DTOs;

/* ─── Register ─── */
public class RegisterDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

/* ─── Login ─── */
public class LoginDto
{
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

/* ─── Response trả về khi xác thực thành công ─── */
public class AuthResponseDto
{
    public string Token  { get; set; } = string.Empty;
    public int    UserId { get; set; }
    public string Name   { get; set; } = string.Empty;
    public string Email  { get; set; } = string.Empty;
    public string Role   { get; set; } = string.Empty;
}
