using System.ComponentModel.DataAnnotations;

namespace mobileAPI.Models.Requests;

public class CreateCategoryRequest
{
    [Required]
    [StringLength(100)]
    public string CategoryName { get; set; } = string.Empty;
}

public class UpdateCategoryRequest
{
    [Required]
    [StringLength(100)]
    public string CategoryName { get; set; } = string.Empty;
}

public class CreateSizeRequest
{
    [Required]
    [StringLength(50)]
    public string SizeName { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }
}
