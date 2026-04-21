using Fitmart.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Data;

public static class DbSeeder
{
    public static void Seed(ApplicationDbContext context)
    {
        // Chạy migration tự động nếu chưa có
        context.Database.EnsureCreated();

        // 1. Thêm Categories
        if (!context.Categories.Any())
        {
            context.Categories.AddRange(
                new Category { Name = "Áo Thun & Áo Lót", Description = "T-Shirts & Tops" },
                new Category { Name = "Áo Hoodie & Áo Khoác", Description = "Hoodies & Jackets" },
                new Category { Name = "Quần Legging & Quần Short", Description = "Leggings & Shorts" },
                new Category { Name = "Quần Dài & Joggers", Description = "Joggers & Tracksuits" },
                new Category { Name = "Phụ Kiện", Description = "Bags, Socks, etc." }
            );
            context.SaveChanges();
        }

        // 2. Thêm Products & Variants (Mô phỏng 10 sản phẩm từ Gymshark)
        if (!context.Products.Any())
        {
            var catTops = context.Categories.First(c => c.Name == "Áo Thun & Áo Lót").Id;
            var catHoodies = context.Categories.First(c => c.Name == "Áo Hoodie & Áo Khoác").Id;
            var catLeggings = context.Categories.First(c => c.Name == "Quần Legging & Quần Short").Id;
            var catJoggers = context.Categories.First(c => c.Name == "Quần Dài & Joggers").Id;
            var catAccessories = context.Categories.First(c => c.Name == "Phụ Kiện").Id;

            var products = new List<Product>
            {
                // 1
                new Product
                {
                    Name = "Vital Seamless 2.0 T-Shirt",
                    Description = "Áo thun ôm sát, tôn dáng mạnh mẽ, cực kỳ mát mịn.",
                    Price = 45.00m,
                    Gender = "Nữ",
                    Collection = "Vital",
                    IsFeatured = true,
                    CategoryId = catTops,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "Black Marl", Size = "S", StockQuantity = 50, ImageUrl = "Fitmart.API/wwwroot/images/products/images-ConditioningClubOversizedT_ShirtGSBlackA2B5Y_BB2J_0624_1de80550-91dc-4eb7-a4a5-a00fb42c4203_640x.webp" },
                        new ProductVariant { Color = "Black Marl", Size = "M", StockQuantity = 100, ImageUrl = "Fitmart.API/wwwroot/images/products/images-ConditioningClubOversizedT_ShirtGSBlackA2B5Y_BB2J_0624_1de80550-91dc-4eb7-a4a5-a00fb42c4203_640x.webp" },
                        new ProductVariant { Color = "Smokey Grey Marl", Size = "M", StockQuantity = 30, ImageUrl = "Fitmart.API/wwwroot/images/products/images-ConditioningClubOversizedT_ShirtGSBlackA2B5Y_BB2J_0624_1de80550-91dc-4eb7-a4a5-a00fb42c4203_640x.webp" }
                    }
                },
                // 2
                new Product
                {
                    Name = "Arrival T-Shirt",
                    Description = "Chất liệu siêu nhẹ, thấm hút mồ hôi tối đa. Hoàn hảo cho các bài tập tạ.",
                    Price = 25.00m,
                    Gender = "Nam",
                    Collection = "Arrival",
                    IsFeatured = true,
                    CategoryId = catTops,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "Black", Size = "M", StockQuantity = 120, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/ArrivalT-ShirtBlack-A2A1E-BBBB.A-Edit_BK.jpg" },
                        new ProductVariant { Color = "Black", Size = "L", StockQuantity = 80, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/ArrivalT-ShirtBlack-A2A1E-BBBB.A-Edit_BK.jpg" },
                        new ProductVariant { Color = "Charcoal", Size = "M", StockQuantity = 60, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/ArrivalT-ShirtCharcoal-A2A1E-GBCV.A-Edit_BK.jpg" }
                    }
                },
                // 3
                new Product
                {
                    Name = "Crest Hoodie",
                    Description = "Áo khoác hoodie thông dụng hàng ngày. Lớp nỉ bông mềm bên trong giúp giữ ấm tuyệt đối.",
                    Price = 50.00m,
                    Gender = "Nam",
                    Collection = "Crest",
                    IsFeatured = false,
                    CategoryId = catHoodies,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "Light Grey Core Marl", Size = "L", StockQuantity = 40, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/CrestHoodieLightGreyCoreMarl-A2A4W-GBBM.A-Edit_BK.jpg" }
                    }
                },
                // 4
                new Product
                {
                    Name = "Apex Perform Joggers",
                    Description = "Quần jogger có độ co giãn 4 chiều cho khả năng di chuyển linh hoạt.",
                    Price = 60.00m,
                    Gender = "Nam",
                    Collection = "Apex",
                    IsFeatured = true,
                    CategoryId = catJoggers,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "Silhouette Grey", Size = "M", StockQuantity = 35, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/ApexPerformJoggersSilhouetteGrey-A2A2Q-GBC2.A-Edit_BK.jpg" },
                        new ProductVariant { Color = "Black", Size = "M", StockQuantity = 40, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/ApexPerformJoggersBlack-A2A2Q-BBBB.A-Edit_BK.jpg" }
                    }
                },
                // 5
                new Product
                {
                    Name = "Adapt Animal Seamless Leggings",
                    Description = "Quần ôm tập gym họa tiết Animal cá tính, lưng siêu cao, nâng mông định hình.",
                    Price = 55.00m,
                    Gender = "Nữ",
                    Collection = "Adapt",
                    IsFeatured = true,
                    CategoryId = catLeggings,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "Black/Grey", Size = "XS", StockQuantity = 20, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/AdaptAnimalSeamlessLeggingsBlack-Grey-B2A6J-GBCM.A-Edit_BK.jpg" },
                        new ProductVariant { Color = "Black/Grey", Size = "S", StockQuantity = 110, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/AdaptAnimalSeamlessLeggingsBlack-Grey-B2A6J-GBCM.A-Edit_BK.jpg" }
                    }
                },
                // 6
                new Product
                {
                    Name = "Essential Oversized T-Shirt",
                    Description = "Áo form rộng thùng thình cho những ngày cần sự thoải mái hoàn toàn.",
                    Price = 30.00m,
                    Gender = "Nam",
                    Collection = "Essential",
                    IsFeatured = false,
                    CategoryId = catTops,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "White", Size = "XL", StockQuantity = 50, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/EssentialOversizedT-ShirtWhite-A2A1A-WWWW.A-Edit_BK.jpg" }
                    }
                },
                // 7
                new Product
                {
                    Name = "Legacy Drop Arm Tank",
                    Description = "Áo ba lỗ nam, thiết kế nách khoét sâu rụng rốn, khoe trọn cơ bắp.",
                    Price = 22.00m,
                    Gender = "Nam",
                    Collection = "Legacy",
                    IsFeatured = true,
                    CategoryId = catTops,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "Black", Size = "L", StockQuantity = 60, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/LegacyDropArmTankBlack-A2A3L-BBBB.A-Edit_BK.jpg" }
                    }
                },
                // 8
                new Product
                {
                    Name = "GS Power Sports Bra",
                    Description = "Áo lót thể thao nâng đỡ định hình hỗ trợ kháng chấn vừa phải cho tập gym & yoga.",
                    Price = 35.00m,
                    Gender = "Nữ",
                    Collection = "GS Power",
                    IsFeatured = true,
                    CategoryId = catTops,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "Cherry Brown", Size = "S", StockQuantity = 45, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/GSPowerSportsBraCherryBrown-B2A2T-RBBQ.A-Edit_BK.jpg" }
                    }
                },
                // 9
                new Product
                {
                    Name = "Everyday Holdall",
                    Description = "Túi trống thể thao Gymshark siêu to khổng lồ, chứa đầy đủ giày, dây nịt, khăn.",
                    Price = 45.00m,
                    Gender = "Unisex",
                    Collection = "Everyday",
                    IsFeatured = false,
                    CategoryId = catAccessories,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "Black", Size = "One Size", StockQuantity = 100, ImageUrl = "https://cdn.shopify.com/s/files/1/0156/6146/products/EverydayHoldallBlack-I1A2V-BBBB.A-Edit_BK.jpg" }
                    }
                },
                // 10
                new Product
                {
                    Name = "Studio Crew Socks",
                    Description = "Combo 3 đôi vớ tập luyện tối giản êm chân, hỗ trợ vùng hõm chân hoàn hảo.",
                    Price = 15.00m,
                    Gender = "Unisex",
                    Collection = "Studio",
                    IsFeatured = true,
                    CategoryId = catAccessories,
                    ProductVariants = new List<ProductVariant>
                    {
                        new ProductVariant { Color = "White", Size = "M", StockQuantity = 200, ImageUrl = "/images/products/image.avif" },
                        new ProductVariant { Color = "Black", Size = "M", StockQuantity = 150, ImageUrl = "/images/products/image.avif" }
                    }
                }
            };

            context.Products.AddRange(products);
            context.SaveChanges();
        }
    }
}