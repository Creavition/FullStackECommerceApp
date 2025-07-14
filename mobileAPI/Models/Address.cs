using System.ComponentModel.DataAnnotations;

namespace mobileAPI.Models
{
    public class Address
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty; // Ev, İş, vs.

        [Required]
        public string AddressLine1 { get; set; } = string.Empty;

        public string? AddressLine2 { get; set; }

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string District { get; set; } = string.Empty;

        [Required]
        public string PostalCode { get; set; } = string.Empty;

        [Required]
        public string Country { get; set; } = "Turkey";

        public string? PhoneNumber { get; set; }

        public bool IsDefault { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation property
        public User? User { get; set; }
    }
}
