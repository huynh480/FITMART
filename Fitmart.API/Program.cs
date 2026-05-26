using System.Text;
using Fitmart.API.Data;
using Fitmart.API.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// ── Controllers ──
builder.Services.AddControllers();

// ── SignalR (Real-time Chat) ──
builder.Services.AddSignalR();

// ── Gemini AI Bot ──
builder.Services.AddHttpClient<Fitmart.API.Services.GeminiService>();

// ── CORS — cho phép React frontend gọi API ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();   // Bắt buộc cho SignalR WebSocket
    });
});

// ── JWT Authentication ──
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret chưa được cấu hình trong appsettings.json");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        };
    });

builder.Services.AddAuthorization();

// ── OpenAPI ──
builder.Services.AddOpenApi();

var app = builder.Build();

// ── Seed data ──
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context  = services.GetRequiredService<ApplicationDbContext>();
    DbSeeder.Seed(context);
    // Seed admin account (chạy sau khi migration đã xong)
    await AdminSeeder.SeedAsync(context);
}

// ── Pipeline ──
if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAll");

app.UseAuthentication();   // ← Phải trước UseAuthorization
app.UseAuthorization();

app.MapControllers();

// ── SignalR endpoint ──
app.MapHub<ChatHub>("/chatHub");

app.Run();
