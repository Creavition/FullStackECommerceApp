using System.ComponentModel.DataAnnotations;

namespace mobileAPI.Models.Requests
{
    public class CreateProductRequest
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 999999.99)]
        public decimal Price { get; set; }

        [Required]
        [StringLength(500)]
        public string FrontImagePath { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string BackImagePath { get; set; } = string.Empty;

        public bool IsFavorite { get; set; } = false;

        // Badge properties - exactly one must be true
        public bool Badge_FlashSale { get; set; } = false;
        public bool Badge_BestSelling { get; set; } = false;

        // Label properties - exactly one must be true
        public bool Label_BestSeller { get; set; } = false;
        public bool Label_FastDelivery { get; set; } = false;

        [Required]
        public int CategoryId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one size must be selected")]
        public List<int> SizeIds { get; set; } = new List<int>();

        // Validation method
        public bool IsValid()
        {
            // Badge constraint: exactly one badge should be true
            var badgeCount = (Badge_FlashSale ? 1 : 0) + (Badge_BestSelling ? 1 : 0);

            // Label constraint: exactly one label should be true
            var labelCount = (Label_BestSeller ? 1 : 0) + (Label_FastDelivery ? 1 : 0);

            return badgeCount == 1 && labelCount == 1 && SizeIds.Count > 0;
        }
    }

    public class UpdateProductRequest
    {
        [StringLength(200)]
        public string? Name { get; set; }

        [Range(0.01, 999999.99)]
        public decimal? Price { get; set; }

        [StringLength(500)]
        public string? FrontImagePath { get; set; }

        [StringLength(500)]
        public string? BackImagePath { get; set; }

        public bool? IsFavorite { get; set; }

        // Badge properties
        public bool? Badge_FlashSale { get; set; }
        public bool? Badge_BestSelling { get; set; }

        // Label properties
        public bool? Label_BestSeller { get; set; }
        public bool? Label_FastDelivery { get; set; }

        public int? CategoryId { get; set; }

        public List<int>? SizeIds { get; set; }
    }

    public class UpdateProductBasicInfoRequest
    {
        [StringLength(200)]
        public string? Name { get; set; }

        [Range(0.01, 999999.99)]
        public decimal? Price { get; set; }

        [StringLength(500)]
        public string? FrontImagePath { get; set; }

        [StringLength(500)]
        public string? BackImagePath { get; set; }
    }

    public class ProductFilterRequest
    {
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public List<int>? SizeIds { get; set; }
        public bool? Badge_FlashSale { get; set; }
        public bool? Badge_BestSelling { get; set; }
        public bool? Label_BestSeller { get; set; }
        public bool? Label_FastDelivery { get; set; }
        public bool? IsFavorite { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class ProductResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string FrontImagePath { get; set; } = string.Empty;
        public string BackImagePath { get; set; } = string.Empty;
        public bool IsFavorite { get; set; }
        public bool Badge_FlashSale { get; set; }
        public bool Badge_BestSelling { get; set; }
        public bool Label_BestSeller { get; set; }
        public bool Label_FastDelivery { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public List<string> AvailableSizes { get; set; } = new List<string>();
        public double AverageRating { get; set; } = 0.0;
        public int ReviewCount { get; set; } = 0;
    }
}
