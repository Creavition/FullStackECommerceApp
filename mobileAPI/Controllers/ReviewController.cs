using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mobileAPI.Data;
using mobileAPI.Models;
using mobileAPI.Models.Requests;
using System.Security.Claims;

namespace mobileAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReviewController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Review/Product/{productId}
    [HttpGet("Product/{productId}")]
    public async Task<ActionResult<object>> GetProductReviews(int productId)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Reviews)
                .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
            {
                return NotFound(new { Message = "Product not found" });
            }

            var reviews = product.Reviews.Select(r => new
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UserName = r.User.Name,
                UserId = r.UserId
            }).OrderByDescending(r => r.CreatedAt).ToList();

            var result = new
            {
                ProductId = productId,
                ProductName = product.Name,
                AverageRating = product.AverageRating,
                TotalReviews = product.ReviewCount,
                Reviews = reviews
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
        }
    }

    // GET: api/Review/User/{userId}
    [HttpGet("User/{userId}")]
    [Authorize]
    public async Task<ActionResult<object>> GetUserReviews(int userId)
    {
        try
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (currentUserId != userId)
            {
                return Forbid("You can only view your own reviews");
            }

            var reviews = await _context.Reviews
                .Include(r => r.Product)
                .Where(r => r.UserId == userId)
                .Select(r => new
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    ProductImageUrl = r.Product.ImageUrl
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
        }
    }

    // POST: api/Review
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<object>> CreateReview([FromBody] CreateReviewRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Validate product exists
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return NotFound(new { Message = "Product not found" });
            }

            // Check if user already reviewed this product
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == request.ProductId);

            if (existingReview != null)
            {
                return BadRequest(new { Message = "You have already reviewed this product" });
            }

            // Validate rating
            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new { Message = "Rating must be between 1 and 5" });
            }

            // Create review
            var review = new Review
            {
                UserId = userId,
                ProductId = request.ProductId,
                Rating = request.Rating,
                Comment = request.Comment ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Return created review with user info
            var user = await _context.Users.FindAsync(userId);
            var result = new
            {
                Id = review.Id,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UserName = user?.Name,
                UserId = review.UserId,
                ProductId = review.ProductId
            };

            return CreatedAtAction(nameof(GetProductReviews), new { productId = request.ProductId }, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
        }
    }

    // PUT: api/Review/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult> UpdateReview(int id, [FromBody] UpdateReviewRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { Message = "Review not found" });
            }

            if (review.UserId != userId)
            {
                return Forbid("You can only update your own reviews");
            }

            // Validate rating
            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new { Message = "Rating must be between 1 and 5" });
            }

            review.Rating = request.Rating;
            review.Comment = request.Comment ?? string.Empty;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Review updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
        }
    }

    // DELETE: api/Review/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeleteReview(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { Message = "Review not found" });
            }

            if (review.UserId != userId)
            {
                return Forbid("You can only delete your own reviews");
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Review deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
        }
    }

    // GET: api/Review/Stats/{productId}
    [HttpGet("Stats/{productId}")]
    public async Task<ActionResult<object>> GetReviewStats(int productId)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
            {
                return NotFound(new { Message = "Product not found" });
            }

            var reviews = product.Reviews;
            var totalReviews = reviews.Count;

            if (totalReviews == 0)
            {
                return Ok(new
                {
                    ProductId = productId,
                    AverageRating = 0.0,
                    TotalReviews = 0,
                    RatingDistribution = new Dictionary<int, int>
                    {
                        { 5, 0 }, { 4, 0 }, { 3, 0 }, { 2, 0 }, { 1, 0 }
                    }
                });
            }

            var averageRating = reviews.Average(r => r.Rating);
            var ratingDistribution = new Dictionary<int, int>();

            for (int i = 1; i <= 5; i++)
            {
                ratingDistribution[i] = reviews.Count(r => r.Rating == i);
            }

            var result = new
            {
                ProductId = productId,
                AverageRating = Math.Round(averageRating, 1),
                TotalReviews = totalReviews,
                RatingDistribution = ratingDistribution
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
        }
    }
}
