using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using mobileAPI.Models;
using mobileAPI.Models.Requests;
using mobileAPI.Services;
using mobileAPI.Data;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// Database connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JwtSettings configuration is missing.");
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddScoped<JwtService>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
        };
    });

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Mobile API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS
app.UseCors();

// Static files middleware - Images klasörü için
app.UseStaticFiles();

// Mevcut Images klasörünü statik dosya olarak servis et
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Images")),
    RequestPath = "/Images"
});

//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    await SeedDatabase(context);
}

app.Run();

async Task SeedDatabase(ApplicationDbContext context)
{
    // Seed test user if no users exist
    if (!context.Users.Any())
    {
        var testUser = new User
        {
            Name = "Test User",
            Email = "test@test.com",
            Role = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123")
        };

        context.Users.Add(testUser);
        await context.SaveChangesAsync();

        Console.WriteLine("Test user created: test@test.com / Test123");
    }

    // Check if products already exist
    if (context.Products.Any())
        return;

    // Ensure we have categories and sizes
    if (!context.Categories.Any())
        return;

    var categories = await context.Categories.Include(c => c.Sizes).ToListAsync();

    var products = new List<Product>();

    foreach (var category in categories)
    {
        if (!category.Sizes.Any())
            continue;

        // Add real products with actual image names for each category
        if (category.CategoryName == "Jacket")
        {
            var jacketProducts = new[]
            {
                new { Name = "Blazer Ceket", Front = "Blazer-Ceket-On.jpg", Back = "Blazer-Ceket-Arka.jpg", Price = 2500 },
                new { Name = "Çift Yırtmaçlı Erkek Ceket", Front = "Cift-Yirtmacli-Erkek-Ceket-On.jpg", Back = "Cift-Yirtmacli-Erkek-Ceket-Arka.jpg", Price = 1800 },
                new { Name = "Comfort Flanel Ceket", Front = "Comfort-Flanel-Ceket-Onjpg.jpg", Back = "Comfort-Flanel-Ceket-Arka.jpg", Price = 1200 },
                new { Name = "Mono Yaka Erkek Ceket", Front = "Mono-Yaka-Erkek-Ceket-On.jpg", Back = "Mono-Yaka-Erkek-Ceket-Arka.jpg", Price = 1500 }
            };

            for (int i = 0; i < jacketProducts.Length; i++)
            {
                var jacket = jacketProducts[i];
                var product = new Product
                {
                    Name = jacket.Name,
                    Price = jacket.Price,
                    FrontImagePath = $"Images/{category.CategoryName}/{jacket.Front}",
                    BackImagePath = $"Images/{category.CategoryName}/{jacket.Back}",
                    IsFavorite = i % 2 == 0,
                    Badge_FlashSale = i == 0,
                    Badge_BestSelling = i != 0,
                    Label_BestSeller = i <= 1,
                    Label_FastDelivery = i > 1,
                    CategoryId = category.Id
                };
                products.Add(product);
            }
        }
        else if (category.CategoryName == "Pants")
        {
            var pantsProducts = new[]
            {
                new { Name = "Antrasit Klasik Pantolon", Front = "Antrasit Klasik Pantolon-On.jpg", Back = "Antrasit Klasik Pantolon-Arka.jpg", Price = 800 },
                new { Name = "Fit Klasik Pantolon", Front = "Fit Klasik Pantolon-On-B.jpg", Back = "Fit Klasik Pantolon-Arka.jpg", Price = 950 },
                new { Name = "Regular Siyah Pantolon", Front = "Regular-Siyap-Pantolon-On.jpg", Back = "Regular-Siyap-Pantolon-Arka.jpg", Price = 750 },
                new { Name = "Spor Siyah Pantolon", Front = "Spor-Siyah-Pantolon-On.jpg", Back = "Spor-Siyah-Pantolon-Arka.jpg", Price = 650 }
            };

            for (int i = 0; i < pantsProducts.Length; i++)
            {
                var pants = pantsProducts[i];
                var product = new Product
                {
                    Name = pants.Name,
                    Price = pants.Price,
                    FrontImagePath = $"Images/{category.CategoryName}/{pants.Front}",
                    BackImagePath = $"Images/{category.CategoryName}/{pants.Back}",
                    IsFavorite = i % 2 == 0,
                    Badge_FlashSale = i == 0,
                    Badge_BestSelling = i != 0,
                    Label_BestSeller = i <= 1,
                    Label_FastDelivery = i > 1,
                    CategoryId = category.Id
                };
                products.Add(product);
            }
        }
        else if (category.CategoryName == "Shoes")
        {
            var shoesProducts = new[]
            {
                new { Name = "Deri Sneaker Ayakkabı", Front = "Deri-Sneaker-Ayakkabi-On.jpg", Back = "Deri-Sneaker-Ayakkabi-Arka.jpg", Price = 1200 },
                new { Name = "Deve Tüyü Deri Bot", Front = "Deve-Tuyu-Deri-Bot-On.jpg", Back = "Deve-Tuyu-Deri-Bot-Arka.jpg", Price = 1800 },
                new { Name = "Kahverengi Deri Sneaker", Front = "Kahverengi-Deri-Sneaker-Ayakkabi-On.jpg", Back = "Kahverengi-Deri-Sneaker-Ayakkabi-Arka.jpg", Price = 1350 },
                new { Name = "Gri Sneaker", Front = "Sneaker-Gri-On.jpg", Back = "Sneaker-Gri-Arka.jpg", Price = 900 }
            };

            for (int i = 0; i < shoesProducts.Length; i++)
            {
                var shoes = shoesProducts[i];
                var product = new Product
                {
                    Name = shoes.Name,
                    Price = shoes.Price,
                    FrontImagePath = $"Images/{category.CategoryName}/{shoes.Front}",
                    BackImagePath = $"Images/{category.CategoryName}/{shoes.Back}",
                    IsFavorite = i % 2 == 0,
                    Badge_FlashSale = i == 0,
                    Badge_BestSelling = i != 0,
                    Label_BestSeller = i <= 1,
                    Label_FastDelivery = i > 1,
                    CategoryId = category.Id
                };
                products.Add(product);
            }
        }
        else if (category.CategoryName == "T-Shirt")
        {
            var tshirtProducts = new[]
            {
                new { Name = "Bisiklet Yaka T-Shirt", Front = "Bisiklet-Yaka-Tshirt-On.jpg", Back = "Bisiklet-Yaka-Tshirt-Arka.jpg", Price = 250 },
                new { Name = "Polo Yaka T-Shirt", Front = "Polo-Yaka-On.jpg", Back = "Polo-Yaka-Arka.jpg", Price = 320 },
                new { Name = "Polo Yaka Triko", Front = "Polo-Yaka-Triko-On.jpg", Back = "Polo-Yaka-Triko-Arka.jpg", Price = 450 },
                new { Name = "Yazlık Triko", Front = "Yazlik-Triko-On.jpg", Back = "Yazlik-Triko-Arka.jpg", Price = 380 }
            };

            for (int i = 0; i < tshirtProducts.Length; i++)
            {
                var tshirt = tshirtProducts[i];
                var product = new Product
                {
                    Name = tshirt.Name,
                    Price = tshirt.Price,
                    FrontImagePath = $"Images/{category.CategoryName}/{tshirt.Front}",
                    BackImagePath = $"Images/{category.CategoryName}/{tshirt.Back}",
                    IsFavorite = i % 2 == 0,
                    Badge_FlashSale = i == 0,
                    Badge_BestSelling = i != 0,
                    Label_BestSeller = i <= 1,
                    Label_FastDelivery = i > 1,
                    CategoryId = category.Id
                };
                products.Add(product);
            }
        }
        else
        {
            // Fallback for any other categories
            for (int i = 1; i <= 4; i++)
            {
                var product = new Product
                {
                    Name = $"{category.CategoryName} Product {i}",
                    Price = 50 + (i * 25),
                    FrontImagePath = $"Images/{category.CategoryName}/{category.CategoryName}Product{i}-Front.jpg",
                    BackImagePath = $"Images/{category.CategoryName}/{category.CategoryName}Product{i}-Back.jpg",
                    IsFavorite = i % 2 == 0,
                    Badge_FlashSale = i == 1,
                    Badge_BestSelling = i != 1,
                    Label_BestSeller = i <= 2,
                    Label_FastDelivery = i > 2,
                    CategoryId = category.Id
                };

                products.Add(product);
            }
        }
    }

    context.Products.AddRange(products);
    await context.SaveChangesAsync();

    // Add ProductSizes
    var productSizes = new List<ProductSize>();
    var savedProducts = await context.Products.ToListAsync();

    foreach (var product in savedProducts)
    {
        var categorySizes = await context.Sizes
            .Where(s => s.CategoryId == product.CategoryId)
            .Take(2) // Add first 2 sizes for each product
            .ToListAsync();

        foreach (var size in categorySizes)
        {
            productSizes.Add(new ProductSize
            {
                ProductId = product.Id,
                SizeId = size.Id
            });
        }
    }

    context.ProductSizes.AddRange(productSizes);
    await context.SaveChangesAsync();
}

[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(LoginRequest))]
[JsonSerializable(typeof(RegisterRequest))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}
