using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using mobileAPI.Models;
using mobileAPI.Models.Requests;
using mobileAPI.Services;
using mobileAPI.Data;
using BCrypt.Net;

namespace mobileAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;

    public AuthController(ApplicationDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        // Validasyon kontrolleri
        if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) ||
            string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.RePassword))
        {
            return BadRequest("Tum alanlar doldurulmalidir.");
        }

        if (request.Password != request.RePassword)
        {
            return BadRequest("Sifreler eslesmiyor.");
        }

        if (request.Password.Length < 6)
        {
            return BadRequest("Sifre en az 6 karakter olmalidir.");
        }

        if (!Regex.IsMatch(request.Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$"))
        {
            return BadRequest("Sifre en az bir buyuk harf, bir kucuk harf ve bir rakam icermelidir.");
        }

        if (!Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return BadRequest("Gecerli bir email adresi giriniz.");
        }

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest("Bu email adresi zaten kayitli.");
        }

        var isFirstUser = !await _context.Users.AnyAsync();

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            // İlk kullanıcıyı admin yapıyoruz, diğerleri user olacak
            Role = isFirstUser ? "Admin" : "User"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok($"Kayit basariyla tamamlandi. Rol: {user.Role}");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Email ve sifre gereklidir.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return BadRequest("Email veya sifre hatali.");
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new { token, message = "Giris basarili." });
    }

    [Authorize]
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var userRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;

        if (userRole != "Admin")
        {
            return Forbid();
        }

        var usersWithoutPasswords = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role
            })
            .ToListAsync();

        return Ok(usersWithoutPasswords);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("make-admin/{id}")]
    public async Task<IActionResult> MakeAdmin(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound("Kullanici bulunamadi.");
        }

        user.Role = "Admin";
        await _context.SaveChangesAsync();
        return Ok("Kullanici admin yapildi.");
    }

    [Authorize]
    [HttpDelete("delete-user/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserEmail = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
        var currentUserRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;

        var userToDelete = await _context.Users.FindAsync(id);
        if (userToDelete == null)
        {
            return NotFound("Kullanici bulunamadi.");
        }

        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == currentUserEmail);

        // Admin istediği kullanıcıyı silebilir, User sadece kendi hesabını silebilir
        if (currentUserRole != "Admin" && currentUser?.Id != id)
        {
            return Forbid("Sadece kendi hesabinizi silebilirsiniz.");
        }

        // Son admin'in silinmesini engelleme
        if (userToDelete.Role == "Admin")
        {
            var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
            if (adminCount <= 1)
            {
                return BadRequest("Son admin kullanici silinemez.");
            }
        }

        _context.Users.Remove(userToDelete);
        await _context.SaveChangesAsync();

        return Ok($"Kullanici '{userToDelete.Name}' basariyla silindi.");
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.CurrentPassword) || string.IsNullOrEmpty(request.NewPassword))
        {
            return BadRequest("Mevcut şifre ve yeni şifre gereklidir.");
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest("Yeni şifreler eşleşmiyor.");
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest("Yeni şifre en az 6 karakter olmalıdır.");
        }

        var currentUserEmail = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(currentUserEmail))
        {
            return BadRequest("Kullanıcı bulunamadı.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == currentUserEmail);
        if (user == null)
        {
            return NotFound("Kullanıcı bulunamadı.");
        }

        // Mevcut şifreyi doğrula
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest("Mevcut şifre yanlış.");
        }

        // Yeni şifreyi hash'le ve kaydet
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok("Şifre başarıyla değiştirildi.");
    }
}