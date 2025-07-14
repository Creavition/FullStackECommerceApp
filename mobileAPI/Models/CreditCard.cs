using System.ComponentModel.DataAnnotations;

namespace mobileAPI.Models
{
    public class CreditCard
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string CardHolderName { get; set; } = string.Empty;

        [Required]
        public string CardNumber { get; set; } = string.Empty; // Bu gerçek uygulamada encrypt edilmeli

        [Required]
        public string ExpiryMonth { get; set; } = string.Empty;

        [Required]
        public string ExpiryYear { get; set; } = string.Empty;

        [Required]
        public string CVV { get; set; } = string.Empty; // Bu gerçek uygulamada encrypt edilmeli

        public string? CardTitle { get; set; } // Kişisel Kart, İş Kartı vs.

        public bool IsDefault { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation property
        public User? User { get; set; }

        // Kart numarasının maskelenmiş halini döndür
        public string MaskedCardNumber =>
            CardNumber.Length >= 4
                ? "**** **** **** " + CardNumber.Substring(CardNumber.Length - 4)
                : CardNumber;
    }
}
