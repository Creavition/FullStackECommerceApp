using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mobileAPI.Data;
using mobileAPI.Models;
using mobileAPI.Models.Requests;

namespace mobileAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    IsFavorite = p.IsFavorite,
                    Badge_FlashSale = p.Badge_FlashSale,
                    Badge_BestSelling = p.Badge_BestSelling,
                    Label_BestSeller = p.Label_BestSeller,
                    Label_FastDelivery = p.Label_FastDelivery,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.CategoryName,
                    AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/Product/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponse>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            var productResponse = new ProductResponse
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                ImageUrl = product.ImageUrl,
                IsFavorite = product.IsFavorite,
                Badge_FlashSale = product.Badge_FlashSale,
                Badge_BestSelling = product.Badge_BestSelling,
                Label_BestSeller = product.Label_BestSeller,
                Label_FastDelivery = product.Label_FastDelivery,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.CategoryName,
                AvailableSizes = product.ProductSizes.Select(ps => ps.Size.SizeName).ToList()
            };

            return Ok(productResponse);
        }

        // GET: api/Product/category/5
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetProductsByCategory(int categoryId)
        {
            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .Where(p => p.CategoryId == categoryId)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    IsFavorite = p.IsFavorite,
                    Badge_FlashSale = p.Badge_FlashSale,
                    Badge_BestSelling = p.Badge_BestSelling,
                    Label_BestSeller = p.Label_BestSeller,
                    Label_FastDelivery = p.Label_FastDelivery,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.CategoryName,
                    AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        // POST: api/Product/filter
        [HttpPost("filter")]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> FilterProducts(ProductFilterRequest filter)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .AsQueryable();

            // Apply filters
            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);
            }

            if (filter.SizeIds != null && filter.SizeIds.Any())
            {
                query = query.Where(p => p.ProductSizes.Any(ps => filter.SizeIds.Contains(ps.SizeId)));
            }

            if (filter.Badge_FlashSale.HasValue)
            {
                query = query.Where(p => p.Badge_FlashSale == filter.Badge_FlashSale.Value);
            }

            if (filter.Badge_BestSelling.HasValue)
            {
                query = query.Where(p => p.Badge_BestSelling == filter.Badge_BestSelling.Value);
            }

            if (filter.Label_BestSeller.HasValue)
            {
                query = query.Where(p => p.Label_BestSeller == filter.Label_BestSeller.Value);
            }

            if (filter.Label_FastDelivery.HasValue)
            {
                query = query.Where(p => p.Label_FastDelivery == filter.Label_FastDelivery.Value);
            }

            if (filter.IsFavorite.HasValue)
            {
                query = query.Where(p => p.IsFavorite == filter.IsFavorite.Value);
            }

            // Apply pagination
            var totalCount = await query.CountAsync();
            var products = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    IsFavorite = p.IsFavorite,
                    Badge_FlashSale = p.Badge_FlashSale,
                    Badge_BestSelling = p.Badge_BestSelling,
                    Label_BestSeller = p.Label_BestSeller,
                    Label_FastDelivery = p.Label_FastDelivery,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.CategoryName,
                    AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList()
                })
                .ToListAsync();

            return Ok(new
            {
                Products = products,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize)
            });
        }

        // POST: api/Product
        [HttpPost]
        public async Task<ActionResult<ProductResponse>> CreateProduct(CreateProductRequest request)
        {
            // Validate request
            if (!request.IsValid())
            {
                return BadRequest(new { message = "Exactly one badge and one label must be selected" });
            }

            // Check if category exists
            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            // Check if all sizes exist and belong to the category
            var sizes = await _context.Sizes
                .Where(s => request.SizeIds.Contains(s.Id) && s.CategoryId == request.CategoryId)
                .ToListAsync();

            if (sizes.Count != request.SizeIds.Count)
            {
                return BadRequest(new { message = "Some sizes are invalid or don't belong to the selected category" });
            }

            var product = new Product
            {
                Name = request.Name,
                Price = request.Price,
                ImageUrl = request.ImageUrl,
                IsFavorite = request.IsFavorite,
                Badge_FlashSale = request.Badge_FlashSale,
                Badge_BestSelling = request.Badge_BestSelling,
                Label_BestSeller = request.Label_BestSeller,
                Label_FastDelivery = request.Label_FastDelivery,
                CategoryId = request.CategoryId
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Add ProductSizes
            foreach (var sizeId in request.SizeIds)
            {
                _context.ProductSizes.Add(new ProductSize
                {
                    ProductId = product.Id,
                    SizeId = sizeId
                });
            }

            await _context.SaveChangesAsync();

            // Return created product
            var createdProduct = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .FirstAsync(p => p.Id == product.Id);

            var response = new ProductResponse
            {
                Id = createdProduct.Id,
                Name = createdProduct.Name,
                Price = createdProduct.Price,
                ImageUrl = createdProduct.ImageUrl,
                IsFavorite = createdProduct.IsFavorite,
                Badge_FlashSale = createdProduct.Badge_FlashSale,
                Badge_BestSelling = createdProduct.Badge_BestSelling,
                Label_BestSeller = createdProduct.Label_BestSeller,
                Label_FastDelivery = createdProduct.Label_FastDelivery,
                CategoryId = createdProduct.CategoryId,
                CategoryName = createdProduct.Category.CategoryName,
                AvailableSizes = createdProduct.ProductSizes.Select(ps => ps.Size.SizeName).ToList()
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, response);
        }

        // PUT: api/Product/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductRequest request)
        {
            var product = await _context.Products
                .Include(p => p.ProductSizes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(request.Name))
                product.Name = request.Name;

            if (request.Price.HasValue)
                product.Price = request.Price.Value;

            if (!string.IsNullOrEmpty(request.ImageUrl))
                product.ImageUrl = request.ImageUrl;

            if (request.IsFavorite.HasValue)
                product.IsFavorite = request.IsFavorite.Value;

            if (request.Badge_FlashSale.HasValue)
                product.Badge_FlashSale = request.Badge_FlashSale.Value;

            if (request.Badge_BestSelling.HasValue)
                product.Badge_BestSelling = request.Badge_BestSelling.Value;

            if (request.Label_BestSeller.HasValue)
                product.Label_BestSeller = request.Label_BestSeller.Value;

            if (request.Label_FastDelivery.HasValue)
                product.Label_FastDelivery = request.Label_FastDelivery.Value;

            if (request.CategoryId.HasValue)
            {
                var category = await _context.Categories.FindAsync(request.CategoryId.Value);
                if (category == null)
                {
                    return NotFound(new { message = "Category not found" });
                }
                product.CategoryId = request.CategoryId.Value;
            }

            // Update sizes if provided
            if (request.SizeIds != null)
            {
                // Remove existing ProductSizes
                _context.ProductSizes.RemoveRange(product.ProductSizes);

                // Add new ProductSizes
                foreach (var sizeId in request.SizeIds)
                {
                    var size = await _context.Sizes.FindAsync(sizeId);
                    if (size == null || size.CategoryId != product.CategoryId)
                    {
                        return BadRequest(new { message = "Some sizes are invalid or don't belong to the selected category" });
                    }

                    _context.ProductSizes.Add(new ProductSize
                    {
                        ProductId = product.Id,
                        SizeId = sizeId
                    });
                }
            }

            // Validate constraints
            if (!product.IsValid())
            {
                return BadRequest(new { message = "Exactly one badge and one label must be selected" });
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Product/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Product/bestsellers
        [HttpGet("bestsellers")]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetBestSellers()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .Where(p => p.Badge_BestSelling)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    IsFavorite = p.IsFavorite,
                    Badge_FlashSale = p.Badge_FlashSale,
                    Badge_BestSelling = p.Badge_BestSelling,
                    Label_BestSeller = p.Label_BestSeller,
                    Label_FastDelivery = p.Label_FastDelivery,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.CategoryName,
                    AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/Product/flashsale
        [HttpGet("flashsale")]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetFlashSaleProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .Where(p => p.Badge_FlashSale)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    IsFavorite = p.IsFavorite,
                    Badge_FlashSale = p.Badge_FlashSale,
                    Badge_BestSelling = p.Badge_BestSelling,
                    Label_BestSeller = p.Label_BestSeller,
                    Label_FastDelivery = p.Label_FastDelivery,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.CategoryName,
                    AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/Product/fastdelivery
        [HttpGet("fastdelivery")]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetFastDeliveryProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .Where(p => p.Label_FastDelivery)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    IsFavorite = p.IsFavorite,
                    Badge_FlashSale = p.Badge_FlashSale,
                    Badge_BestSelling = p.Badge_BestSelling,
                    Label_BestSeller = p.Label_BestSeller,
                    Label_FastDelivery = p.Label_FastDelivery,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.CategoryName,
                    AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}
