using System.ComponentModel.DataAnnotations;

namespace mobileAPI.Models;

public class Size
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string SizeName { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    // Navigation property
    public virtual Category Category { get; set; } = null!;
}
