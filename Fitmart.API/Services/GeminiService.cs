using System.Text;
using System.Text.Json;

namespace Fitmart.API.Services;

/// <summary>
/// Service gọi Google Gemini API để tạo phản hồi AI thông minh.
/// Dùng làm fallback khi không khớp từ khóa trong ChatHub.
/// </summary>
public class GeminiService
{
    private readonly HttpClient _http;
    private readonly ILogger<GeminiService> _logger;
    private readonly string _apiKey;

    private const string ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    private const string SYSTEM_PROMPT =
        "Bạn là Trợ lý ảo thông minh tên là FITMART Bot của cửa hàng quần áo thể thao cao cấp FITMART. " +
        "Hãy trả lời khách hàng một cách lịch sự, ngắn gọn dưới 3 câu, sử dụng icon phù hợp " +
        "và luôn hướng khách hàng chọn mua các sản phẩm đồ tập gym/yoga của FITMART.";

    public GeminiService(HttpClient http, ILogger<GeminiService> logger, IConfiguration config)
    {
        _http   = http;
        _logger = logger;
        _apiKey = config["Gemini:ApiKey"]
            ?? "AIzaSyBBHkfpZT6wkTkHZGQ-92l7oQxxLxOccXM";
    }

    /// <summary>
    /// Gửi tin nhắn của khách lên Gemini và nhận phản hồi AI.
    /// </summary>
    public async Task<string> GetAIReplyAsync(string userMessage)
    {
        try
        {
            var url = $"{ENDPOINT}?key={_apiKey}";

            // Cấu trúc request theo Gemini API spec
            var payload = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = SYSTEM_PROMPT } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = userMessage } }
                    }
                },
                generationConfig = new
                {
                    temperature     = 0.7,
                    maxOutputTokens = 256,
                    topP            = 0.9,
                }
            };

            var json    = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _http.PostAsync(url, content);
            var body     = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("⚠️ Gemini API error {Status}: {Body}",
                    (int)response.StatusCode, body.Length > 300 ? body[..300] : body);
                return "Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể liên hệ hotline hoặc chờ nhân viên hỗ trợ nhé! 📞";
            }

            // Parse response JSON
            using var doc = JsonDocument.Parse(body);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text?.Trim() ?? "Mình chưa thể trả lời lúc này, nhân viên sẽ hỗ trợ bạn sớm nhé! 🙏";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Gemini API call failed");
            return "Xin lỗi, hệ thống AI đang bận. Nhân viên sẽ hỗ trợ bạn ngay! 🛠️";
        }
    }
}
