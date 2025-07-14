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
                .Include(p => p.Reviews)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    FrontImagePath = p.FrontImagePath,
                    BackImagePath = p.BackImagePath,
                    IsFavorite = p.IsFavorite,
                    Badge_FlashSale = p.Badge_FlashSale,
                    Badge_BestSelling = p.Badge_BestSelling,
                    Label_BestSeller = p.Label_BestSeller,
                    Label_FastDelivery = p.Label_FastDelivery,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.CategoryName,
                    AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList(),
                    AverageRating = p.Reviews.Count > 0 ? p.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = p.Reviews.Count
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/Product/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponse>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            var response = new ProductResponse
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                FrontImagePath = product.FrontImagePath,
                BackImagePath = product.BackImagePath,
                IsFavorite = product.IsFavorite,
                Badge_FlashSale = product.Badge_FlashSale,
                Badge_BestSelling = product.Badge_BestSelling,
                Label_BestSeller = product.Label_BestSeller,
                Label_FastDelivery = product.Label_FastDelivery,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.CategoryName,
                AvailableSizes = product.ProductSizes.Select(ps => ps.Size.SizeName).ToList(),
                AverageRating = product.Reviews.Count > 0 ? product.Reviews.Average(r => r.Rating) : 0,
                ReviewCount = product.Reviews.Count
            };

            return Ok(response);
        }

        // GET: api/Product/category/{categoryId}
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetProductsByCategory(int categoryId)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .Include(p => p.Reviews)
                .Where(p => p.CategoryId == categoryId)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    FrontImagePath = p.FrontImagePath,
                    BackImagePath = p.BackImagePath,
                    IsFavorite = p.IsFavorite,
                    Badge_FlashSale = p.Badge_FlashSale,
                    Badge_BestSelling = p.Badge_BestSelling,
                    Label_BestSeller = p.Label_BestSeller,
                    Label_FastDelivery = p.Label_FastDelivery,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.CategoryName,
                    AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList(),
                    AverageRating = p.Reviews.Count > 0 ? p.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = p.Reviews.Count
                })
                .ToListAsync();

            return Ok(products);
        }

        // POST: api/Product
        [HttpPost]
        public async Task<ActionResult<ProductResponse>> CreateProduct(CreateProductRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!request.IsValid())
            {
                return BadRequest("Invalid badge or label configuration. Exactly one badge and one label must be selected.");
            }

            // Check if category exists
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
            if (!categoryExists)
            {
                return BadRequest($"Category with ID {request.CategoryId} does not exist.");
            }

            // Check if all sizes exist
            var existingSizes = await _context.Sizes.Where(s => request.SizeIds.Contains(s.Id)).ToListAsync();
            if (existingSizes.Count != request.SizeIds.Count)
            {
                return BadRequest("One or more size IDs are invalid.");
            }

            var product = new Product
            {
                Name = request.Name,
                Price = request.Price,
                FrontImagePath = request.FrontImagePath,
                BackImagePath = request.BackImagePath,
                IsFavorite = request.IsFavorite,
                Badge_FlashSale = request.Badge_FlashSale,
                Badge_BestSelling = request.Badge_BestSelling,
                Label_BestSeller = request.Label_BestSeller,
                Label_FastDelivery = request.Label_FastDelivery,
                CategoryId = request.CategoryId
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Add product sizes
            foreach (var sizeId in request.SizeIds)
            {
                _context.ProductSizes.Add(new ProductSize
                {
                    ProductId = product.Id,
                    SizeId = sizeId
                });
            }

            await _context.SaveChangesAsync();

            // Return the created product
            var createdProduct = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes)
                .ThenInclude(ps => ps.Size)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            if (createdProduct == null)
            {
                return StatusCode(500, "Error retrieving created product");
            }

            var response = new ProductResponse
            {
                Id = createdProduct.Id,
                Name = createdProduct.Name,
                Price = createdProduct.Price,
                FrontImagePath = createdProduct.FrontImagePath,
                BackImagePath = createdProduct.BackImagePath,
                IsFavorite = createdProduct.IsFavorite,
                Badge_FlashSale = createdProduct.Badge_FlashSale,
                Badge_BestSelling = createdProduct.Badge_BestSelling,
                Label_BestSeller = createdProduct.Label_BestSeller,
                Label_FastDelivery = createdProduct.Label_FastDelivery,
                CategoryId = createdProduct.CategoryId,
                CategoryName = createdProduct.Category?.CategoryName ?? "",
                AvailableSizes = createdProduct.ProductSizes.Select(ps => ps.Size.SizeName).ToList(),
                AverageRating = 0,
                ReviewCount = 0
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, response);
        }

        // PUT: api/Product/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products
                .Include(p => p.ProductSizes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.Name))
                product.Name = request.Name;

            if (request.Price.HasValue)
                product.Price = request.Price.Value;

            if (!string.IsNullOrWhiteSpace(request.FrontImagePath))
                product.FrontImagePath = request.FrontImagePath;

            if (!string.IsNullOrWhiteSpace(request.BackImagePath))
                product.BackImagePath = request.BackImagePath;

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
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId.Value);
                if (!categoryExists)
                {
                    return BadRequest($"Category with ID {request.CategoryId.Value} does not exist.");
                }
                product.CategoryId = request.CategoryId.Value;
            }

            // Update sizes if provided
            if (request.SizeIds != null && request.SizeIds.Any())
            {
                var existingSizes = await _context.Sizes.Where(s => request.SizeIds.Contains(s.Id)).ToListAsync();
                if (existingSizes.Count != request.SizeIds.Count)
                {
                    return BadRequest("One or more size IDs are invalid.");
                }

                // Remove existing product sizes
                _context.ProductSizes.RemoveRange(product.ProductSizes);

                // Add new product sizes
                foreach (var sizeId in request.SizeIds)
                {
                    _context.ProductSizes.Add(new ProductSize
                    {
                        ProductId = product.Id,
                        SizeId = sizeId
                    });
                }
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

        // PUT: api/Product/{id}/basic-info
        [HttpPut("{id}/basic-info")]
        public async Task<IActionResult> UpdateProductBasicInfo(int id, UpdateProductBasicInfoRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            try
            {
                if (!string.IsNullOrWhiteSpace(request.Name))
                {
                    product.Name = request.Name;
                }

                if (request.Price.HasValue)
                {
                    product.Price = request.Price.Value;
                }

                if (!string.IsNullOrWhiteSpace(request.FrontImagePath))
                {
                    product.FrontImagePath = request.FrontImagePath;
                }

                if (!string.IsNullOrWhiteSpace(request.BackImagePath))
                {
                    product.BackImagePath = request.BackImagePath;
                }

                _context.Entry(product).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Product updated successfully",
                    productId = id,
                    updatedFields = new
                    {
                        name = request.Name != null ? product.Name : null,
                        price = request.Price.HasValue ? (decimal?)product.Price : null,
                        frontImagePath = request.FrontImagePath != null ? product.FrontImagePath : null,
                        backImagePath = request.BackImagePath != null ? product.BackImagePath : null
                    }
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound($"Product with ID {id} not found.");
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while updating the product",
                    error = ex.Message
                });
            }
        }

        // PUT: api/Product/{id}/favorite
        [HttpPut("{id}/favorite")]
        public async Task<IActionResult> ToggleFavorite(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.IsFavorite = !product.IsFavorite;
            await _context.SaveChangesAsync();

            return Ok(new { isFavorite = product.IsFavorite });
        }

        // PUT: api/Product/{id}/sizes
        [HttpPut("{id}/sizes")]
        public async Task<IActionResult> UpdateProductSizes(int id, [FromBody] UpdateProductSizesRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products
                .Include(p => p.ProductSizes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            // Validate that all size IDs exist
            if (request.SizeIds != null && request.SizeIds.Any())
            {
                var existingSizes = await _context.Sizes.Where(s => request.SizeIds.Contains(s.Id)).ToListAsync();
                if (existingSizes.Count != request.SizeIds.Count)
                {
                    var invalidSizeIds = request.SizeIds.Except(existingSizes.Select(s => s.Id)).ToList();
                    return BadRequest($"Invalid size IDs: {string.Join(", ", invalidSizeIds)}");
                }

                // Remove existing product sizes
                _context.ProductSizes.RemoveRange(product.ProductSizes);

                // Add new product sizes
                foreach (var sizeId in request.SizeIds)
                {
                    _context.ProductSizes.Add(new ProductSize
                    {
                        ProductId = product.Id,
                        SizeId = sizeId
                    });
                }
            }
            else
            {
                // If no sizes provided, remove all existing sizes
                _context.ProductSizes.RemoveRange(product.ProductSizes);
            }

            try
            {
                await _context.SaveChangesAsync();

                // Return updated product with new sizes
                var updatedProduct = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.ProductSizes)
                    .ThenInclude(ps => ps.Size)
                    .Include(p => p.Reviews)
                    .Where(p => p.Id == id)
                    .Select(p => new ProductResponse
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        FrontImagePath = p.FrontImagePath,
                        BackImagePath = p.BackImagePath,
                        IsFavorite = p.IsFavorite,
                        Badge_FlashSale = p.Badge_FlashSale,
                        Badge_BestSelling = p.Badge_BestSelling,
                        Label_BestSeller = p.Label_BestSeller,
                        Label_FastDelivery = p.Label_FastDelivery,
                        CategoryId = p.CategoryId,
                        CategoryName = p.Category.CategoryName,
                        AvailableSizes = p.ProductSizes.Select(ps => ps.Size.SizeName).ToList(),
                        AverageRating = p.Reviews.Count > 0 ? p.Reviews.Average(r => r.Rating) : 0,
                        ReviewCount = p.Reviews.Count
                    })
                    .FirstOrDefaultAsync();

                return Ok(updatedProduct);
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
        }

        // DELETE: api/Product/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductSizes)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            // Remove related data
            _context.ProductSizes.RemoveRange(product.ProductSizes);
            _context.Reviews.RemoveRange(product.Reviews);
            _context.Products.Remove(product);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}
