using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobileAPI.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsFavorite { get; set; } = false;

        // Badge properties - sadece biri true olabilir
        public bool Badge_FlashSale { get; set; } = false;
        public bool Badge_BestSelling { get; set; } = false;

        // Label properties - sadece biri true olabilir
        public bool Label_BestSeller { get; set; } = false;
        public bool Label_FastDelivery { get; set; } = false;

        // Category relationship
        [Required]
        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; } = null!;

        // Available sizes for this product (many-to-many relationship)
        public virtual ICollection<ProductSize> ProductSizes { get; set; } = new List<ProductSize>();

        // Reviews for this product
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

        // Computed property to get available size names
        [NotMapped]
        public List<string> AvailableSizes => ProductSizes?.Select(ps => ps.Size.SizeName).ToList() ?? new List<string>();

        // Computed property to get average rating
        [NotMapped]
        public double AverageRating => Reviews?.Count > 0 ? Reviews.Average(r => r.Rating) : 0.0;

        // Computed property to get total review count
        [NotMapped]
        public int ReviewCount => Reviews?.Count ?? 0;

        // Validation method to ensure badge and label constraints
        public bool IsValid()
        {
            // Badge constraint: exactly one badge should be true
            var badgeCount = (Badge_FlashSale ? 1 : 0) + (Badge_BestSelling ? 1 : 0);

            // Label constraint: exactly one label should be true
            var labelCount = (Label_BestSeller ? 1 : 0) + (Label_FastDelivery ? 1 : 0);

            return badgeCount == 1 && labelCount == 1;
        }
    }

    // Junction table for Product-Size many-to-many relationship
    public class ProductSize
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; } = null!;

        [Required]
        public int SizeId { get; set; }

        [ForeignKey("SizeId")]
        public virtual Size Size { get; set; } = null!;
    }
}
