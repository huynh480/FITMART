using System.Net;
using System.Text;
using System.Text.Json;

namespace Fitmart.API.Services;

/// <summary>
/// Service gọi ChatGPT API (OpenAI) để tạo phản hồi AI thông minh.
/// Dùng làm fallback khi không khớp từ khóa trong ChatHub.
/// </summary>
public class ChatGPTService
{
    private readonly HttpClient _http;
    private readonly ILogger<ChatGPTService> _logger;
    private readonly string _apiKey;
    private readonly string _apiUrl;

    private const string SYSTEM_PROMPT =
        "Bạn là Trợ lý ảo thông minh tên là FITMART Bot của cửa hàng quần áo thể thao cao cấp FITMART. " +
        "Hãy trả lời khách hàng một cách lịch sự, ngắn gọn dưới 3 câu, sử dụng icon phù hợp " +
        "và luôn hướng khách hàng chọn mua các sản phẩm đồ tập gym/yoga của FITMART.";

    private const int MAX_RETRIES = 3;

    public ChatGPTService(HttpClient http, ILogger<ChatGPTService> logger, IConfiguration config)
    {
        _http   = http;
        _logger = logger;
        _apiKey = config["ChatGPT:ApiKey"]
            ?? "sk-W8S4SPcV9Gq88V7XMO4JIQHJayWq8ABRGZzT1oZH4BElC0yJ";
        _apiUrl = config["ChatGPT:ApiUrl"]
            ?? "https://api.chatanywhere.tech/v1/chat/completions";
    }

    /// <summary>
    /// Gửi tin nhắn của khách lên ChatGPT và nhận phản hồi AI.
    /// productContext chứa dữ liệu sản phẩm thực từ DB để AI tư vấn chuẩn xác.
    /// Tự động retry khi gặp 429 Rate Limit.
    /// </summary>
    public async Task<string> GetAIReplyAsync(string userMessage, string productContext = "")
    {
        try
        {
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

            // Cấu trúc request theo OpenAI Chat Completion API spec
            var payload = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = fullSystemPrompt },
                    new { role = "user", content = userMessage }
                },
                temperature = 0.7,
                max_tokens = 256,
                top_p = 0.9
            };

            var json = JsonSerializer.Serialize(payload);

            // ── Retry loop cho 429 Rate Limit ──
            for (int attempt = 1; attempt <= MAX_RETRIES; attempt++)
            {
                var request = new HttpRequestMessage(HttpMethod.Post, _apiUrl)
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };

                // Add Authorization header
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

                var response = await _http.SendAsync(request);
                var body     = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    // Parse response JSON
                    using var doc = JsonDocument.Parse(body);
                    var text = doc.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString();

                    return text?.Trim() ?? "Mình chưa thể trả lời lúc này, nhân viên sẽ hỗ trợ bạn sớm nhé! 🙏";
                }

                // 429 Too Many Requests → chờ rồi retry
                if (response.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    var delay = attempt * 2000; // 2s, 4s, 6s
                    _logger.LogWarning("⏳ ChatGPT 429 Rate Limit (attempt {Attempt}/{Max}), retry after {Delay}ms",
                        attempt, MAX_RETRIES, delay);
                    await Task.Delay(delay);
                    continue;
                }

                // Lỗi khác → log và return fallback
                _logger.LogWarning("⚠️ ChatGPT API error {Status}: {Body}",
                    (int)response.StatusCode, body.Length > 500 ? body[..500] : body);
                return "Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể liên hệ hotline hoặc chờ nhân viên hỗ trợ nhé! 📞";
            }

            // Hết retry
            _logger.LogWarning("⚠️ ChatGPT API: exhausted {Max} retries (429)", MAX_RETRIES);
            return "Hệ thống AI đang bận, bạn vui lòng thử lại sau hoặc chờ nhân viên hỗ trợ nhé! 🙏";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ ChatGPT API call failed");
            return "Xin lỗi, hệ thống AI đang bận. Nhân viên sẽ hỗ trợ bạn ngay! 🛠️";
        }
    }
}
