using System.Text.Json;
using System.Text.Json.Serialization;
using System.IO;
using Fitmart.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Fitmart.API.Data;

public static class DbSeeder
{
    private class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Collection { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public List<string> Sizes { get; set; }
        public int Stock { get; set; }
        public bool IsNew { get; set; }
        public bool IsBestSeller { get; set; }
        public string ImageUrl { get; set; }
        public string Slug { get; set; }
    }

    public static void Seed(ApplicationDbContext context)
    {
        // Xóa db cũ để seed lại từ đầu với data mới (Chỉ dùng cho dev/demo)
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        if (!context.Categories.Any())
        {
            var categories = new List<Category>
            {
                new Category { Name = "Áo Thun & Áo Lót", Description = "T-Shirts & Tops" },
                new Category { Name = "Áo Hoodie & Áo Khoác", Description = "Hoodies & Jackets" },
                new Category { Name = "Quần Legging & Quần Short", Description = "Leggings & Shorts" },
                new Category { Name = "Quần Dài & Joggers", Description = "Joggers & Tracksuits" },
                new Category { Name = "Phụ Kiện", Description = "Bags, Socks, etc." }
            };
            context.Categories.AddRange(categories);
            context.SaveChanges();
        }

        if (!context.Products.Any())
        {
            var catTops = context.Categories.First(c => c.Name == "Áo Thun & Áo Lót").Id;
            var catHoodies = context.Categories.First(c => c.Name == "Áo Hoodie & Áo Khoác").Id;
            var catLeggings = context.Categories.First(c => c.Name == "Quần Legging & Quần Short").Id;
            var catJoggers = context.Categories.First(c => c.Name == "Quần Dài & Joggers").Id;
            var catAccessories = context.Categories.First(c => c.Name == "Phụ Kiện").Id;

            string jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "products.json");
            if (File.Exists(jsonPath))
            {
                string jsonString = File.ReadAllText(jsonPath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var productDtos = JsonSerializer.Deserialize<List<ProductDto>>(jsonString, options);

                if (productDtos != null)
                {
                    var products = new List<Product>();
                    var random = new Random();

                    // Các ảnh placeholder tùy theo category (Nam/Nữ/Phụ kiện)
                    var namImages = new[] { "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80", "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80", "https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=500&q=80" };
                    var nuImages = new[] { "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80", "https://images.unsplash.com/photo-1608228064614-b6db6509f7a5?w=500&q=80", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80" };
                    var accImages = new[] { "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80", "https://images.unsplash.com/photo-1590239926660-7a0e5b3ee0b8?w=500&q=80" };

                    foreach (var dto in productDtos)
                    {
                        // Xác định CategoryId dựa trên tên sản phẩm
                        int catId = catTops;
                        var nameLower = dto.Name.ToLower();
                        if (nameLower.Contains("hoodie") || nameLower.Contains("khoác")) catId = catHoodies;
                        else if (nameLower.Contains("legging") || nameLower.Contains("short")) catId = catLeggings;
                        else if (nameLower.Contains("quần") || nameLower.Contains("jogger")) catId = catJoggers;
                        if (dto.Category == "Phụ kiện") catId = catAccessories;

                        // Chọn ảnh ngẫu nhiên phù hợp
                        string imgUrl = "";
                        if (dto.Category == "Nam") imgUrl = namImages[random.Next(namImages.Length)];
                        else if (dto.Category == "Nữ") imgUrl = nuImages[random.Next(nuImages.Length)];
                        else imgUrl = accImages[random.Next(accImages.Length)];

                        var product = new Product
                        {
                            Name = dto.Name,
                            Description = dto.Description,
                            Price = dto.Price,
                            Gender = dto.Category == "Phụ kiện" ? "Unisex" : dto.Category,
                            Collection = dto.Collection,
                            IsFeatured = dto.IsBestSeller,
                            CategoryId = catId,
                            ProductVariants = new List<ProductVariant>
                            {
                                new ProductVariant
                                {
                                    Color = "Default",
                                    Size = dto.Sizes != null && dto.Sizes.Count > 0 ? dto.Sizes[0] : "One Size",
                                    StockQuantity = dto.Stock,
                                    ImageUrl = imgUrl
                                }
                            }
                        };
                        products.Add(product);
                    }
                    context.Products.AddRange(products);
                    context.SaveChanges();
                }
            }
        }
    }
}