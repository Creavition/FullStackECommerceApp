using System.ComponentModel.DataAnnotations;

namespace mobileAPI.Models.Requests
{
    public class AddAddressRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;

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
    }

    public class UpdateAddressRequest
    {
        public string? Title { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? PhoneNumber { get; set; }
        public bool? IsDefault { get; set; }
    }
}
