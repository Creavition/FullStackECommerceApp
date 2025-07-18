using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mobileAPI.Data;
using mobileAPI.Models;
using mobileAPI.Models.Requests;

namespace mobileAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreditCardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CreditCardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CreditCard
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCreditCards()
        {
            var userId = 1;

            var creditCards = await _context.CreditCards
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.IsDefault)
                .ThenByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.CardHolderName,
                    c.MaskedCardNumber,
                    c.CardNumber, // Tam kart numarası (edit için gerekli)
                    c.ExpiryMonth,
                    c.ExpiryYear,
                    // CVV güvenlik nedeniyle döndürülmez
                    c.CardTitle,
                    c.IsDefault,
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(creditCards);
        }

        // GET: api/CreditCard/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCreditCard(int id)
        {
            var userId = 1; // Demo için sabit değer

            var creditCard = await _context.CreditCards
                .Where(c => c.Id == id && c.UserId == userId)
                .Select(c => new
                {
                    c.Id,
                    c.CardHolderName,
                    c.MaskedCardNumber,
                    c.CardNumber, // Tam kart numarası (edit için gerekli)
                    c.ExpiryMonth,
                    c.ExpiryYear,
                    // CVV güvenlik nedeniyle döndürülmez
                    c.CardTitle,
                    c.IsDefault,
                    c.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (creditCard == null)
            {
                return NotFound();
            }

            return Ok(creditCard);
        }

        // POST: api/CreditCard
        [HttpPost]
        public async Task<ActionResult<object>> PostCreditCard(AddCreditCardRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Ek doğrulamalar
            if (!int.TryParse(request.ExpiryMonth, out int month) || month < 1 || month > 12)
            {
                return BadRequest("Ay 01-12 arasında olmalıdır");
            }

            if (!int.TryParse(request.ExpiryYear, out int year) || year < 25 || year > 35)
            {
                return BadRequest("Yıl 25-35 arasında olmalıdır");
            }

            var userId = 1;


            var cleanCardNumber = new string(request.CardNumber.Where(char.IsDigit).ToArray());

            if (cleanCardNumber.Length < 13 || cleanCardNumber.Length > 19)
            {
                return BadRequest("Invalid card number length");
            }

            // Aynı kart numarası zaten kayıtlı mı kontrol et
            var existingCard = await _context.CreditCards
                .FirstOrDefaultAsync(c => c.UserId == userId && c.CardNumber == cleanCardNumber);

            if (existingCard != null)
            {
                return BadRequest("This card is already registered");
            }

            // Eğer bu kart default olarak işaretlendiyse, diğer kartların default'unu kaldır
            if (request.IsDefault)
            {
                var existingDefaultCards = await _context.CreditCards
                    .Where(c => c.UserId == userId && c.IsDefault)
                    .ToListAsync();

                foreach (var card in existingDefaultCards)
                {
                    card.IsDefault = false;
                }
            }

            var creditCard = new CreditCard
            {
                UserId = userId,
                CardHolderName = request.CardHolderName,
                CardNumber = cleanCardNumber,
                ExpiryMonth = request.ExpiryMonth.PadLeft(2, '0'), // 2 haneli format
                ExpiryYear = request.ExpiryYear.PadLeft(2, '0'),   // 2 haneli format
                CVV = request.CVV, 
                CardTitle = request.CardTitle,
                IsDefault = request.IsDefault,
                CreatedAt = DateTime.Now
            };

            _context.CreditCards.Add(creditCard);
            await _context.SaveChangesAsync();

            var result = new
            {
                creditCard.Id,
                creditCard.CardHolderName,
                creditCard.MaskedCardNumber,
                creditCard.ExpiryMonth,
                creditCard.ExpiryYear,
                creditCard.CardTitle,
                creditCard.IsDefault,
                creditCard.CreatedAt
            };

            return CreatedAtAction(nameof(GetCreditCard), new { id = creditCard.Id }, result);
        }

        // PUT: api/CreditCard/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCreditCard(int id, UpdateCreditCardRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Doğrulamalar
            if (!string.IsNullOrEmpty(request.ExpiryMonth))
            {
                if (!int.TryParse(request.ExpiryMonth, out int month) || month < 1 || month > 12)
                {
                    return BadRequest("Ay 01-12 arasında olmalıdır");
                }
            }

            if (!string.IsNullOrEmpty(request.ExpiryYear))
            {
                if (!int.TryParse(request.ExpiryYear, out int year) || year < 25 || year > 35)
                {
                    return BadRequest("Yıl 25-35 arasında olmalıdır");
                }
            }

            var userId = 1; 

            var creditCard = await _context.CreditCards
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (creditCard == null)
            {
                return NotFound();
            }

            // Eğer bu kart default olarak işaretlendiyse, diğer kartların default'unu kaldır
            if (request.IsDefault == true && !creditCard.IsDefault)
            {
                var existingDefaultCards = await _context.CreditCards
                    .Where(c => c.UserId == userId && c.IsDefault && c.Id != id)
                    .ToListAsync();

                foreach (var card in existingDefaultCards)
                {
                    card.IsDefault = false;
                }
            }

            // Güncellemeleri uygula
            if (!string.IsNullOrEmpty(request.CardHolderName))
                creditCard.CardHolderName = request.CardHolderName;
            if (!string.IsNullOrEmpty(request.CardNumber))
            {
                var cleanCardNumber = new string(request.CardNumber.Where(char.IsDigit).ToArray());
                creditCard.CardNumber = cleanCardNumber;
            }
            if (!string.IsNullOrEmpty(request.ExpiryMonth))
                creditCard.ExpiryMonth = request.ExpiryMonth.PadLeft(2, '0'); // 2 haneli format
            if (!string.IsNullOrEmpty(request.ExpiryYear))
                creditCard.ExpiryYear = request.ExpiryYear.PadLeft(2, '0');   // 2 haneli format
            if (!string.IsNullOrEmpty(request.CVV))
                creditCard.CVV = request.CVV;
            if (request.CardTitle != null)
                creditCard.CardTitle = request.CardTitle;
            if (request.IsDefault.HasValue)
                creditCard.IsDefault = request.IsDefault.Value;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CreditCardExists(id, userId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Güncellenmiş kartı döndür
            var result = new
            {
                creditCard.Id,
                creditCard.CardHolderName,
                creditCard.MaskedCardNumber,
                creditCard.CardNumber,
                creditCard.ExpiryMonth,
                creditCard.ExpiryYear,
                creditCard.CardTitle,
                creditCard.IsDefault,
                creditCard.CreatedAt
            };

            return Ok(result);
        }

        // DELETE: api/CreditCard/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCreditCard(int id)
        {
            var userId = 1; // Demo için sabit değer

            var creditCard = await _context.CreditCards
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (creditCard == null)
            {
                return NotFound();
            }

            _context.CreditCards.Remove(creditCard);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/CreditCard/5/SetDefault
        [HttpPost("{id}/SetDefault")]
        public async Task<IActionResult> SetDefaultCreditCard(int id)
        {
            var userId = 1; // Demo için sabit değer

            var creditCard = await _context.CreditCards
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (creditCard == null)
            {
                return NotFound();
            }

            // Diğer tüm kartların default'unu kaldır
            var existingDefaultCards = await _context.CreditCards
                .Where(c => c.UserId == userId && c.IsDefault)
                .ToListAsync();

            foreach (var card in existingDefaultCards)
            {
                card.IsDefault = false;
            }

            // Bu kartı default yap
            creditCard.IsDefault = true;

            await _context.SaveChangesAsync();

            var result = new
            {
                creditCard.Id,
                creditCard.CardHolderName,
                creditCard.MaskedCardNumber,
                creditCard.ExpiryMonth,
                creditCard.ExpiryYear,
                creditCard.CardTitle,
                creditCard.IsDefault,
                creditCard.CreatedAt
            };

            return Ok(result);
        }

        private bool CreditCardExists(int id, int userId)
        {
            return _context.CreditCards.Any(e => e.Id == id && e.UserId == userId);
        }
    }
}
