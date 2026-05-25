using System.Text.Json;
using System.IO;
using Fitmart.API.Models;

namespace Fitmart.API.Data;

public static class DbSeeder
{
    private class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Collection { get; set; } = "";
        public string Category { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Price { get; set; }
        public List<string> Sizes { get; set; } = new();
        public int Stock { get; set; }
        public bool IsNew { get; set; }
        public bool IsBestSeller { get; set; }
        public string ImageUrl { get; set; } = "";
        public List<string> DetailImages { get; set; } = new();
        public string Slug { get; set; } = "";
    }

    public static void Seed(ApplicationDbContext context)
    {
        // Dev mode: xóa và tạo lại DB mỗi lần khởi động
        // context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        // ════════════════════════════════════════════════════════
        //  SEED USERS
        // ════════════════════════════════════════════════════════
        if (!context.Users.Any())
        {
            context.Users.AddRange(
                new User { FullName = "Nguyễn Văn Test", Email = "test@fitmart.vn", Password = "123456", Role = "Customer" },
                new User { FullName = "Admin FITMART", Email = "admin@fitmart.vn", Password = "admin123", Role = "Admin" }
            );
            context.SaveChanges();
        }

        // ════════════════════════════════════════════════════════
        //  SEED CATEGORIES — theo đúng cấu trúc navMenuData.js
        // ════════════════════════════════════════════════════════
        if (!context.Categories.Any())
        {
            var categories = new List<Category>
            {
                // ── NAM ──────────────────────────────────────────
                new() { Name = "Áo T-Shirt Nam",      Slug = "ao-t-shirt",       Gender = "nam",    Description = "Áo T-Shirt thể thao nam thoáng khí, co giãn bốn chiều." },
                new() { Name = "Áo Tank Top Nam",     Slug = "ao-tank-top",      Gender = "nam",    Description = "Áo tank top nam co giãn tốt, thấm hút mồ hôi nhanh." },
                new() { Name = "Áo Hoodie Nam",       Slug = "ao-hoodie",        Gender = "nam",    Description = "Hoodie nam oversized giữ ấm, thiết kế tối giản." },
                new() { Name = "Áo Zip Nam",          Slug = "ao-zip",           Gender = "nam",    Description = "Áo khoác zip nam linh hoạt, phù hợp tập gym và street." },
                new() { Name = "Quần Short Nam",      Slug = "quan-short",       Gender = "nam",    Description = "Quần short nam thoáng khí, độ co giãn cao." },
                new() { Name = "Quần Jogger Nam",     Slug = "quan-jogger",      Gender = "nam",    Description = "Quần jogger nam co giãn, cổ chân bo." },
                new() { Name = "Quần Legging Nam",    Slug = "quan-legging-nam", Gender = "nam",    Description = "Quần legging nam ôm sát hỗ trợ cơ bắp." },
                // Bộ sưu tập Nam
                new() { Name = "LEGACY — Nam",        Slug = "legacy",           Gender = "nam",    Description = "Bộ sưu tập LEGACY nam huyền thoại, chất liệu cao cấp." },
                new() { Name = "STUDIO — Nam",        Slug = "studio",           Gender = "nam",    Description = "Bộ sưu tập STUDIO nam phong cách tối giản." },
                new() { Name = "GS POWER — Nam",      Slug = "gs-power",         Gender = "nam",    Description = "Bộ sưu tập GS POWER nam hiệu suất tối đa." },

                // ── NỮ ──────────────────────────────────────────
                new() { Name = "Sports Bra",          Slug = "sports-bra",       Gender = "nu",     Description = "Sports bra hỗ trợ tối đa, kiểu dáng thời trang." },
                new() { Name = "Áo Crop Top Nữ",     Slug = "ao-crop-top",      Gender = "nu",     Description = "Áo crop top nữ nhẹ thoáng, phù hợp yoga và gym." },
                new() { Name = "Áo Hoodie Nữ",       Slug = "ao-hoodie-nu",     Gender = "nu",     Description = "Hoodie nữ mềm mại, ôm nhẹ, giữ ấm hiệu quả." },
                new() { Name = "Áo Tank Nữ",         Slug = "ao-tank-nu",       Gender = "nu",     Description = "Tank top nữ thiết kế thanh lịch, vải co giãn tốt." },
                new() { Name = "Quần Legging Nữ",    Slug = "quan-legging",     Gender = "nu",     Description = "Legging nữ ôm sát, không thấu, co giãn hoàn hảo." },
                new() { Name = "Quần Short Nữ",      Slug = "quan-short-nu",    Gender = "nu",     Description = "Quần short nữ thoáng mát, phù hợp chạy bộ và gym." },
                new() { Name = "Quần Jogger Nữ",     Slug = "quan-jogger-nu",   Gender = "nu",     Description = "Jogger nữ co giãn cao, kiểu dáng trẻ trung." },
                // Bộ sưu tập Nữ
                new() { Name = "VITAL — Nữ",         Slug = "vital",            Gender = "nu",     Description = "Bộ sưu tập VITAL nữ nổi bật nhất của FITMART." },
                new() { Name = "EVERYDAY — Nữ",      Slug = "everyday",         Gender = "nu",     Description = "Bộ sưu tập EVERYDAY nữ cho mọi buổi tập hàng ngày." },
                new() { Name = "GS POWER — Nữ",      Slug = "gs-power-nu",      Gender = "nu",     Description = "Bộ sưu tập GS POWER nữ cường độ cao." },

                // ── PHỤ KIỆN ────────────────────────────────────
                new() { Name = "Gym Bag",             Slug = "gym-bag",          Gender = "unisex", Description = "Túi gym chuyên dụng nhiều ngăn, chất liệu bền bỉ." },
                new() { Name = "Túi Duffel",          Slug = "tui-duffel",       Gender = "unisex", Description = "Túi duffel thể thao dung tích lớn." },
                new() { Name = "Balo Tập",            Slug = "balo-tap",         Gender = "unisex", Description = "Balo tập gym thiết kế thực dụng, thông thoáng lưng." },
                new() { Name = "Dây Kháng Lực",       Slug = "day-khang-luc",    Gender = "unisex", Description = "Bộ dây kháng lực đa mức độ cho mọi bài tập." },
                new() { Name = "Găng Tay Tập",        Slug = "gang-tay",         Gender = "unisex", Description = "Găng tay tập gym bảo vệ lòng bàn tay, thoáng khí." },
                new() { Name = "Đai Lưng",            Slug = "dai-lung",         Gender = "unisex", Description = "Đai lưng hỗ trợ cột sống khi tập nặng." },
                new() { Name = "Vớ Thể Thao",         Slug = "vo-the-thao",      Gender = "unisex", Description = "Vớ thể thao cổ thấp, chống trượt, chống mùi." },
                new() { Name = "Đồ Lót Thể Thao",     Slug = "do-lot",           Gender = "unisex", Description = "Đồ lót thể thao co giãn tốt, vải kháng khuẩn." },
                new() { Name = "Băng Đầu",            Slug = "bang-dau",         Gender = "unisex", Description = "Băng đầu thấm mồ hôi khi tập cường độ cao." },
                new() { Name = "Khăn Cổ",             Slug = "khan-co",          Gender = "unisex", Description = "Khăn cổ thể thao đa năng cho mọi điều kiện thời tiết." },
            };

            context.Categories.AddRange(categories);
            context.SaveChanges();
        }

        // ════════════════════════════════════════════════════════
        //  SEED PRODUCTS từ products.json
        // ════════════════════════════════════════════════════════
        if (!context.Products.Any())
        {
            // Map slug danh mục → CategoryId
            var catMap = context.Categories
                .ToDictionary(c => c.Slug ?? "", c => c.Id);

            // Fallback theo gender
            var fallbackNam    = catMap.GetValueOrDefault("ao-t-shirt");
            var fallbackNu     = catMap.GetValueOrDefault("sports-bra");
            var fallbackPhuKien = catMap.GetValueOrDefault("gym-bag");

            string jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "products.json");
            if (!File.Exists(jsonPath)) return;

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var dtos = JsonSerializer.Deserialize<List<ProductDto>>(File.ReadAllText(jsonPath), options);
            if (dtos == null) return;

            var products = new List<Product>();

            foreach (var dto in dtos)
            {
                var nameLower = dto.Name.ToLower();
                var catRaw    = (dto.Category ?? "").ToLower().Trim();

                int catId;
                string gender;

                if (catRaw == "phụ kiện" || catRaw == "phu kien")
                {
                    gender = "unisex";
                    // Phân loại phụ kiện theo tên
                    if (nameLower.Contains("túi") || nameLower.Contains("balo") || nameLower.Contains("duffel"))
                        catId = catMap.GetValueOrDefault("gym-bag", fallbackPhuKien);
                    else if (nameLower.Contains("găng") || nameLower.Contains("đai") || nameLower.Contains("dây"))
                        catId = catMap.GetValueOrDefault("gang-tay", fallbackPhuKien);
                    else if (nameLower.Contains("vớ"))
                        catId = catMap.GetValueOrDefault("vo-the-thao", fallbackPhuKien);
                    else
                        catId = fallbackPhuKien;
                }
                else if (catRaw == "nữ" || catRaw == "nu")
                {
                    gender = "nu";
                    if (nameLower.Contains("bra") || nameLower.Contains("crop"))
                        catId = catMap.GetValueOrDefault("sports-bra", fallbackNu);
                    else if (nameLower.Contains("legging"))
                        catId = catMap.GetValueOrDefault("quan-legging", fallbackNu);
                    else if (nameLower.Contains("short"))
                        catId = catMap.GetValueOrDefault("quan-short-nu", fallbackNu);
                    else if (nameLower.Contains("jogger"))
                        catId = catMap.GetValueOrDefault("quan-jogger-nu", fallbackNu);
                    else if (nameLower.Contains("hoodie"))
                        catId = catMap.GetValueOrDefault("ao-hoodie-nu", fallbackNu);
                    else if (nameLower.Contains("tank"))
                        catId = catMap.GetValueOrDefault("ao-tank-nu", fallbackNu);
                    else
                        catId = catMap.GetValueOrDefault("ao-crop-top", fallbackNu);
                }
                else // Nam (mặc định)
                {
                    gender = "nam";
                    if (nameLower.Contains("hoodie") || nameLower.Contains("zip"))
                        catId = catMap.GetValueOrDefault("ao-hoodie", fallbackNam);
                    else if (nameLower.Contains("legging"))
                        catId = catMap.GetValueOrDefault("quan-legging-nam", fallbackNam);
                    else if (nameLower.Contains("short"))
                        catId = catMap.GetValueOrDefault("quan-short", fallbackNam);
                    else if (nameLower.Contains("jogger") || (nameLower.Contains("quần") && !nameLower.Contains("short") && !nameLower.Contains("legging")))
                        catId = catMap.GetValueOrDefault("quan-jogger", fallbackNam);
                    else if (nameLower.Contains("tank"))
                        catId = catMap.GetValueOrDefault("ao-tank-top", fallbackNam);
                    else
                        catId = catMap.GetValueOrDefault("ao-t-shirt", fallbackNam);
                }

                var product = new Product
                {
                    Name        = dto.Name,
                    Description = dto.Description,
                    Price       = dto.Price,
                    Gender      = gender == "nam" ? "Nam" : gender == "nu" ? "Nữ" : "Unisex",
                    Collection  = dto.Collection,
                    IsFeatured  = dto.IsBestSeller,
                    CategoryId  = catId,
                    ProductVariants = new List<ProductVariant>()
                };

                var sizes = dto.Sizes?.Any() == true ? dto.Sizes : new List<string> { "One Size" };
                foreach (var size in sizes)
                {
                    product.ProductVariants.Add(new ProductVariant
                    {
                        Color         = "Default",
                        Size          = size,
                        StockQuantity = dto.Stock,
                        ImageUrl      = dto.ImageUrl
                    });
                }

                products.Add(product);

                // ── Tạo danh sách ảnh chi tiết (ProductImages) từ JSON ──
                if (dto.DetailImages?.Any() == true)
                {
                    foreach (var imgUrl in dto.DetailImages)
                    {
                        product.ProductImages.Add(new ProductImage
                        {
                            ImageUrl = imgUrl
                        });
                    }
                }
            }

            context.Products.AddRange(products);
            context.SaveChanges();
        }
    }
}