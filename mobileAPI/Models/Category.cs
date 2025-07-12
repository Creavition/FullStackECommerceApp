using System.ComponentModel.DataAnnotations;

namespace mobileAPI.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string CategoryName { get; set; } = string.Empty;

    // Navigation property
    public virtual ICollection<Size> Sizes { get; set; } = new List<Size>();
}
