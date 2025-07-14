using System.ComponentModel.DataAnnotations;

namespace mobileAPI.Models.Requests
{
    public class AddCreditCardRequest
    {
        [Required]
        public string CardHolderName { get; set; } = string.Empty;

        [Required]
        [StringLength(19, MinimumLength = 13)] // 16 digit kart + space'ler
        public string CardNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(2, MinimumLength = 2)]
        [RegularExpression(@"^(0[1-9]|1[0-2])$", ErrorMessage = "Ay 01-12 arasında olmalıdır")]
        public string ExpiryMonth { get; set; } = string.Empty;

        [Required]
        [StringLength(2, MinimumLength = 2)]
        [RegularExpression(@"^(2[5-9]|3[0-5])$", ErrorMessage = "Yıl 25-35 arasında olmalıdır")]
        public string ExpiryYear { get; set; } = string.Empty;

        [Required]
        [StringLength(4, MinimumLength = 3)]
        public string CVV { get; set; } = string.Empty;

        public string? CardTitle { get; set; }

        public bool IsDefault { get; set; } = false;
    }

    public class UpdateCreditCardRequest
    {
        public string? CardHolderName { get; set; }
        public string? CardNumber { get; set; }

        [RegularExpression(@"^(0[1-9]|1[0-2])$", ErrorMessage = "Ay 01-12 arasında olmalıdır")]
        public string? ExpiryMonth { get; set; }

        [RegularExpression(@"^(2[5-9]|3[0-5])$", ErrorMessage = "Yıl 25-35 arasında olmalıdır")]
        public string? ExpiryYear { get; set; }

        public string? CVV { get; set; }
        public string? CardTitle { get; set; }
        public bool? IsDefault { get; set; }
    }
}
