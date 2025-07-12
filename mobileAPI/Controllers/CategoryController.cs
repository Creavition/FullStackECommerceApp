using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mobileAPI.Data;
using mobileAPI.Models;
using mobileAPI.Models.Requests;

namespace mobileAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoryController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Category
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Include(c => c.Sizes)
            .ToListAsync();

        var result = categories.Select(c => new
        {
            c.Id,
            c.CategoryName,
            Sizes = c.Sizes.Select(s => new { s.Id, s.SizeName }).ToList()
        });

        return Ok(result);
    }

    // GET: api/Category/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Sizes)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound("Kategori bulunamadı.");
        }

        var result = new
        {
            category.Id,
            category.CategoryName,
            Sizes = category.Sizes.Select(s => new { s.Id, s.SizeName }).ToList()
        };

        return Ok(result);
    }

    // POST: api/Category
    [HttpPost]
    public async Task<IActionResult> CreateCategory(CreateCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Aynı isimde kategori var mı kontrol et
        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.CategoryName == request.CategoryName);

        if (existingCategory != null)
        {
            return BadRequest("Bu isimde bir kategori zaten mevcut.");
        }

        var category = new Category
        {
            CategoryName = request.CategoryName
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new
        {
            category.Id,
            category.CategoryName
        });
    }

    // PUT: api/Category/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound("Kategori bulunamadı.");
        }

        // Aynı isimde başka kategori var mı kontrol et
        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.CategoryName == request.CategoryName && c.Id != id);

        if (existingCategory != null)
        {
            return BadRequest("Bu isimde bir kategori zaten mevcut.");
        }

        category.CategoryName = request.CategoryName;

        _context.Categories.Update(category);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            category.Id,
            category.CategoryName
        });
    }

    // DELETE: api/Category/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Sizes)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound("Kategori bulunamadı.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok($"Kategori '{category.CategoryName}' başarıyla silindi.");
    }

    // POST: api/Category/{categoryId}/sizes
    [HttpPost("{categoryId}/sizes")]
    public async Task<IActionResult> CreateSize(int categoryId, CreateSizeRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var category = await _context.Categories.FindAsync(categoryId);
        if (category == null)
        {
            return NotFound("Kategori bulunamadı.");
        }

        // Aynı kategoride aynı beden var mı kontrol et
        var existingSize = await _context.Sizes
            .FirstOrDefaultAsync(s => s.CategoryId == categoryId && s.SizeName == request.SizeName);

        if (existingSize != null)
        {
            return BadRequest("Bu kategoride bu beden zaten mevcut.");
        }

        var size = new Size
        {
            SizeName = request.SizeName,
            CategoryId = categoryId
        };

        _context.Sizes.Add(size);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = categoryId }, new
        {
            size.Id,
            size.SizeName,
            size.CategoryId
        });
    }

    // GET: api/Category/{categoryId}/sizes
    [HttpGet("{categoryId}/sizes")]
    public async Task<IActionResult> GetCategorySizes(int categoryId)
    {
        var category = await _context.Categories.FindAsync(categoryId);
        if (category == null)
        {
            return NotFound("Kategori bulunamadı.");
        }

        var sizes = await _context.Sizes
            .Where(s => s.CategoryId == categoryId)
            .Select(s => new { s.Id, s.SizeName })
            .ToListAsync();

        return Ok(sizes);
    }

    // DELETE: api/Category/sizes/{sizeId}
    [HttpDelete("sizes/{sizeId}")]
    public async Task<IActionResult> DeleteSize(int sizeId)
    {
        var size = await _context.Sizes.FindAsync(sizeId);
        if (size == null)
        {
            return NotFound("Beden bulunamadı.");
        }

        _context.Sizes.Remove(size);
        await _context.SaveChangesAsync();

        return Ok($"Beden '{size.SizeName}' başarıyla silindi.");
    }

    // POST: api/Category/seed - Varsayılan kategorileri ekle
    [HttpPost("seed")]
    public async Task<IActionResult> SeedCategories()
    {
        // Zaten veri var mı kontrol et
        var existingCount = await _context.Categories.CountAsync();
        if (existingCount > 0)
        {
            return BadRequest("Kategoriler zaten mevcut.");
        }

        var categoriesWithSizes = new Dictionary<string, string[]>
        {
            { "Jacket", new[] { "S", "M", "L", "XL" } },
            { "Pants", new[] { "30", "32", "34", "36" } },
            { "T-Shirt", new[] { "S", "M", "L", "XL" } },
            { "Shoes", new[] { "40", "42", "43", "44" } }
        };

        foreach (var categoryData in categoriesWithSizes)
        {
            var category = new Category
            {
                CategoryName = categoryData.Key
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync(); // ID'yi almak için

            foreach (var sizeName in categoryData.Value)
            {
                var size = new Size
                {
                    SizeName = sizeName,
                    CategoryId = category.Id
                };
                _context.Sizes.Add(size);
            }
        }

        await _context.SaveChangesAsync();

        return Ok("Varsayılan kategoriler ve bedenler başarıyla eklendi.");
    }
}
