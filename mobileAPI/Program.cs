using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using mobileAPI.Models;
using mobileAPI.Models.Requests;
using mobileAPI.Services;
using mobileAPI.Data;

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

        // Add 4 products per category
        for (int i = 1; i <= 4; i++)
        {
            var product = new Product
            {
                Name = $"{category.CategoryName} Product {i}",
                Price = 50 + (i * 25),
                ImageUrl = "https://via.placeholder.com/300x300",
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
