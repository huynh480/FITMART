using System.Text.Json;
using System.IO;
using Fitmart.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Linq;

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
        context.Database.EnsureCreated();

        // Kiểm tra nghiêm ngặt: chỉ nạp dữ liệu mẫu nếu các bảng Products và Categories đang trống hoàn toàn
        if (context.Products.Any() || context.Categories.Any())
        {
            SyncNuoiDatabase(context);
            return;
        }

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

        // Luôn chạy đồng bộ ảnh và mô tả sau khi seed
        SyncNuoiDatabase(context);
    }

    public static void SyncNuoiDatabase(ApplicationDbContext context)
    {
        var rootDir = Path.Combine(Directory.GetCurrentDirectory(), "..");
        var nuoiDbPath = Path.GetFullPath(Path.Combine(rootDir, "NuoiDatabase"));
        if (!Directory.Exists(nuoiDbPath))
        {
            return;
        }

        var subDirs = Directory.GetDirectories(nuoiDbPath);
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg" };
        var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var destDir = Path.Combine(wwwrootPath, "images", "products");

        // Lấy toàn bộ sản phẩm kèm variants và images vào bộ nhớ để khớp nối bằng ToSlug
        var allProducts = context.Products
            .Include(p => p.ProductVariants)
            .Include(p => p.ProductImages)
            .ToList();

        foreach (var subDir in subDirs)
        {
            var folderName = Path.GetFileName(subDir);
            
            // Đọc file mô tả mota.txt
            var motaPath = Path.Combine(subDir, "mota.txt");
            var description = "";
            if (File.Exists(motaPath))
            {
                description = File.ReadAllText(motaPath, Encoding.UTF8).Trim();
            }

            // Quét danh sách file ảnh
            var imageFiles = Directory.GetFiles(subDir)
                .Where(file => allowedExtensions.Contains(Path.GetExtension(file).ToLower()))
                .ToList();

            // Nếu mota.txt trống và không có ảnh nào, bỏ qua thư mục này
            if (string.IsNullOrEmpty(description) && imageFiles.Count == 0)
            {
                continue;
            }

            // Khớp nối theo ToSlug(Name) hoặc Name gốc
            var product = allProducts
                .FirstOrDefault(p => ToSlug(p.Name) == folderName || 
                                     p.Name.Equals(folderName, StringComparison.OrdinalIgnoreCase));

            if (product != null)
            {
                System.Console.WriteLine($"[SyncNuoiDatabase] Dong bo thu muc: {folderName} -> San pham: {product.Name}");

                // Cập nhật Description nếu mota.txt không rỗng
                if (!string.IsNullOrEmpty(description))
                {
                    product.Description = description;
                    System.Console.WriteLine($"  - Cap nhat mo ta: \"{description.Substring(0, Math.Min(description.Length, 45))}...\"");
                }

                // Xử lý hình ảnh
                if (imageFiles.Count > 0)
                {
                    if (!Directory.Exists(destDir))
                    {
                        Directory.CreateDirectory(destDir);
                    }

                    // Lấy danh sách màu sắc thực tế (loại trừ Default) để xoay vòng
                    var colors = product.ProductVariants
                        .Select(v => v.Color)
                        .Where(c => !string.IsNullOrEmpty(c) && c != "Default")
                        .Distinct()
                        .ToList();

                    int imageIndex = 0;
                    foreach (var imgFile in imageFiles)
                    {
                        var fileName = Path.GetFileName(imgFile);
                        var destFileName = $"{folderName}_{fileName}";
                        var destFilePath = Path.Combine(destDir, destFileName);

                        // Copy ảnh sang thư mục đích wwwroot
                        File.Copy(imgFile, destFilePath, true);

                        var dbImageUrl = $"/images/products/{destFileName}";

                        // Kiểm tra ảnh đã tồn tại trong ProductImages chưa
                        var existingImg = product.ProductImages
                            .FirstOrDefault(pi => pi.ImageUrl == dbImageUrl);

                        string? assignedColor = null;
                        if (colors.Count > 0)
                        {
                            assignedColor = colors[imageIndex % colors.Count];
                        }

                        if (existingImg != null)
                        {
                            existingImg.ColorName = assignedColor;
                        }
                        else
                        {
                            var newProductImage = new ProductImage
                            {
                                ImageUrl = dbImageUrl,
                                ColorName = assignedColor,
                                ProductId = product.Id
                            };
                            context.ProductImages.Add(newProductImage);
                        }

                        System.Console.WriteLine($"  - Copy anh: {fileName} -> {destFileName} (Mau: {assignedColor ?? "Mac dinh"})");
                        imageIndex++;
                    }
                }

                context.SaveChanges();
            }
            else
            {
                System.Console.WriteLine($"[SyncNuoiDatabase] Khong tim thay san pham cho thu muc: {folderName}");
            }
        }
    }

    private static string ToSlug(string text)
    {
        if (string.IsNullOrEmpty(text)) return "";
        text = text.ToLowerInvariant();
        
        // Thay thế ký tự tiếng Việt có dấu
        string[] arr1 = new string[] { "á", "à", "ả", "ã", "ạ", "â", "ấ", "ầ", "ẩ", "ẫ", "ậ", "ă", "ắ", "ằ", "ẳ", "ẵ", "ặ",
            "đ",
            "é", "è", "ẻ", "ẽ", "ẹ", "ê", "ế", "ề", "ể", "ễ", "ệ",
            "í", "ì", "ỉ", "ĩ", "ị",
            "ó", "ò", "ỏ", "õ", "ọ", "ô", "ố", "ồ", "ổ", "ỗ", "ộ", "ơ", "ớ", "ờ", "ở", "ỡ", "ợ",
            "ú", "ù", "ủ", "ũ", "ụ", "ư", "ứ", "ừ", "ử", "ữ", "ự",
            "ý", "ỳ", "ỷ", "ỹ", "ỵ" };
        string[] arr2 = new string[] { "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a",
            "d",
            "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e",
            "i", "i", "i", "i", "i",
            "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o",
            "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u",
            "y", "y", "y", "y", "y" };
            
        for (int i = 0; i < arr1.Length; i++)
        {
            text = text.Replace(arr1[i], arr2[i]);
        }
        
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[áàảãạâấầẩẫậăắằẳẵặ]", "a");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[éèẻẽẹêếềểễệ]", "e");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[íìỉĩị]", "i");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[óòỏõọôốồổỗộơớờởỡợ]", "o");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[úùủũụưứừửữự]", "u");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[ýỳỷỹỵ]", "y");
        text = text.Replace("đ", "d");

        // Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ cái, số và khoảng trắng / dấu gạch ngang
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[^a-z0-9\s-]", "");
        // Thay thế khoảng trắng bằng dấu gạch ngang
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", "-");
        // Rút gọn các dấu gạch ngang liền nhau
        text = System.Text.RegularExpressions.Regex.Replace(text, @"-+", "-");
        
        return text.Trim('-');
    }
}