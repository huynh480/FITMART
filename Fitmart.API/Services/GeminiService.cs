using System.Net;
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

    // ✅ Đổi sang gemini-2.0-flash (gemini-1.5-flash đã bị Google deprecated → 404)
    private const string ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private const string SYSTEM_PROMPT =
        "Bạn là Trợ lý ảo thông minh tên là FITMART Bot của cửa hàng quần áo thể thao cao cấp FITMART. " +
        "Hãy trả lời khách hàng một cách lịch sự, ngắn gọn dưới 3 câu, sử dụng icon phù hợp " +
        "và luôn hướng khách hàng chọn mua các sản phẩm đồ tập gym/yoga của FITMART.";

    private const int MAX_RETRIES = 3;

    public GeminiService(HttpClient http, ILogger<GeminiService> logger, IConfiguration config)
    {
        _http   = http;
        _logger = logger;
        _apiKey = config["Gemini:ApiKey"]
            ?? "AIzaSyBBHkfpZT6wkTkHZGQ-92l7oQxxLxOccXM";
    }

    /// <summary>
    /// Gửi tin nhắn của khách lên Gemini và nhận phản hồi AI.
    /// productContext chứa dữ liệu sản phẩm thực từ DB để AI tư vấn chuẩn xác.
    /// Tự động retry khi gặp 429 Rate Limit.
    /// </summary>
    public async Task<string> GetAIReplyAsync(string userMessage, string productContext = "")
    {
        try
        {
            var url = $"{ENDPOINT}?key={_apiKey}";

            // Ghép System Prompt + dữ liệu sản phẩm thực
            var fullSystemPrompt = SYSTEM_PROMPT;
            if (!string.IsNullOrWhiteSpace(productContext))
            {
                fullSystemPrompt += "\n\n" +
                    "Đây là danh sách sản phẩm và giá hiện có tại cửa hàng FITMART để bạn tham khảo tư vấn cho khách:\n" +
                    productContext + "\n" +
                    "Hãy dựa vào danh sách trên để trả lời chính xác tên và giá sản phẩm khi khách hỏi. " +
                    "Nếu khách hỏi sản phẩm không có trong danh sách, hãy gợi ý các sản phẩm tương tự có sẵn.";
            }

            // Cấu trúc request theo Gemini API spec
            var payload = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = fullSystemPrompt } }
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

            var json = JsonSerializer.Serialize(payload);

            // ── Retry loop cho 429 Rate Limit ──
            for (int attempt = 1; attempt <= MAX_RETRIES; attempt++)
            {
                var content  = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(url, content);
                var body     = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
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

                // 429 Too Many Requests → chờ rồi retry
                if (response.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    var delay = attempt * 2000; // 2s, 4s, 6s
                    _logger.LogWarning("⏳ Gemini 429 Rate Limit (attempt {Attempt}/{Max}), retry after {Delay}ms",
                        attempt, MAX_RETRIES, delay);
                    await Task.Delay(delay);
                    continue;
                }

                // Lỗi khác → log và return fallback
                _logger.LogWarning("⚠️ Gemini API error {Status}: {Body}",
                    (int)response.StatusCode, body.Length > 500 ? body[..500] : body);
                return "Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể liên hệ hotline hoặc chờ nhân viên hỗ trợ nhé! 📞";
            }

            // Hết retry
            _logger.LogWarning("⚠️ Gemini API: exhausted {Max} retries (429)", MAX_RETRIES);
            return "Hệ thống AI đang bận, bạn vui lòng thử lại sau hoặc chờ nhân viên hỗ trợ nhé! 🙏";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Gemini API call failed");
            return "Xin lỗi, hệ thống AI đang bận. Nhân viên sẽ hỗ trợ bạn ngay! 🛠️";
        }
    }
}
