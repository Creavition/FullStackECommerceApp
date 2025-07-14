using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mobileAPI.Data;
using mobileAPI.Models;
using mobileAPI.Models.Requests;
using System.Security.Claims;

namespace mobileAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AddressController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Address
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Address>>> GetAddresses()
        {
            // Gerçek uygulamada JWT token'dan alınmalı
            var userId = 1; // Demo için sabit değer

            var addresses = await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(addresses);
        }

        // GET: api/Address/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Address>> GetAddress(int id)
        {
            var userId = 1; // Demo için sabit değer

            var address = await _context.Addresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
            {
                return NotFound();
            }

            return Ok(address);
        }

        // POST: api/Address
        [HttpPost]
        public async Task<ActionResult<Address>> PostAddress(AddAddressRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = 1; // Demo için sabit değer

            // Eğer bu adres default olarak işaretlendiyse, diğer adreslerin default'unu kaldır
            if (request.IsDefault)
            {
                var existingDefaultAddresses = await _context.Addresses
                    .Where(a => a.UserId == userId && a.IsDefault)
                    .ToListAsync();

                foreach (var addr in existingDefaultAddresses)
                {
                    addr.IsDefault = false;
                }
            }

            var address = new Address
            {
                UserId = userId,
                Title = request.Title,
                AddressLine1 = request.AddressLine1,
                AddressLine2 = request.AddressLine2,
                City = request.City,
                District = request.District,
                PostalCode = request.PostalCode,
                Country = request.Country,
                PhoneNumber = request.PhoneNumber,
                IsDefault = request.IsDefault,
                CreatedAt = DateTime.Now
            };

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAddress), new { id = address.Id }, address);
        }

        // PUT: api/Address/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAddress(int id, UpdateAddressRequest request)
        {
            var userId = 1; // Demo için sabit değer

            var address = await _context.Addresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
            {
                return NotFound();
            }

            // Eğer bu adres default olarak işaretlendiyse, diğer adreslerin default'unu kaldır
            if (request.IsDefault == true && !address.IsDefault)
            {
                var existingDefaultAddresses = await _context.Addresses
                    .Where(a => a.UserId == userId && a.IsDefault && a.Id != id)
                    .ToListAsync();

                foreach (var addr in existingDefaultAddresses)
                {
                    addr.IsDefault = false;
                }
            }

            // Güncellemeleri uygula
            if (!string.IsNullOrEmpty(request.Title))
                address.Title = request.Title;
            if (!string.IsNullOrEmpty(request.AddressLine1))
                address.AddressLine1 = request.AddressLine1;
            if (request.AddressLine2 != null)
                address.AddressLine2 = request.AddressLine2;
            if (!string.IsNullOrEmpty(request.City))
                address.City = request.City;
            if (!string.IsNullOrEmpty(request.District))
                address.District = request.District;
            if (!string.IsNullOrEmpty(request.PostalCode))
                address.PostalCode = request.PostalCode;
            if (!string.IsNullOrEmpty(request.Country))
                address.Country = request.Country;
            if (request.PhoneNumber != null)
                address.PhoneNumber = request.PhoneNumber;
            if (request.IsDefault.HasValue)
                address.IsDefault = request.IsDefault.Value;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AddressExists(id, userId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Address/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var userId = 1; // Demo için sabit değer

            var address = await _context.Addresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
            {
                return NotFound();
            }

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Address/5/SetDefault
        [HttpPost("{id}/SetDefault")]
        public async Task<IActionResult> SetDefaultAddress(int id)
        {
            var userId = 1; // Demo için sabit değer

            var address = await _context.Addresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
            {
                return NotFound();
            }

            // Diğer tüm adreslerin default'unu kaldır
            var existingDefaultAddresses = await _context.Addresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync();

            foreach (var addr in existingDefaultAddresses)
            {
                addr.IsDefault = false;
            }

            // Bu adresi default yap
            address.IsDefault = true;

            await _context.SaveChangesAsync();
            return Ok(address);
        }

        private bool AddressExists(int id, int userId)
        {
            return _context.Addresses.Any(e => e.Id == id && e.UserId == userId);
        }
    }
}
