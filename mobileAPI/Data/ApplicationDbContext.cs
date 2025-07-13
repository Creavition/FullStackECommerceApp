using Microsoft.EntityFrameworkCore;
using mobileAPI.Models;

namespace mobileAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Size> Sizes { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductSize> ProductSizes { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();

            entity.Property(e => e.Email).IsRequired();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).IsRequired();
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(e => e.CategoryName).IsRequired();
        });

        modelBuilder.Entity<Size>(entity =>
        {
            entity.Property(e => e.SizeName).IsRequired();
            entity.HasOne(s => s.Category)
                  .WithMany(c => c.Sizes)
                  .HasForeignKey(s => s.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FrontImagePath).IsRequired();
            entity.Property(e => e.BackImagePath).IsRequired();

            entity.HasOne(p => p.Category)
                  .WithMany()
                  .HasForeignKey(p => p.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductSize>(entity =>
        {
            entity.HasKey(ps => new { ps.ProductId, ps.SizeId });

            entity.HasOne(ps => ps.Product)
                  .WithMany(p => p.ProductSizes)
                  .HasForeignKey(ps => ps.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ps => ps.Size)
                  .WithMany()
                  .HasForeignKey(ps => ps.SizeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.Property(e => e.Rating).IsRequired();
            entity.Property(e => e.Comment)
                  .HasMaxLength(1000);

            entity.HasOne(r => r.User)
                  .WithMany()
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Product)
                  .WithMany(p => p.Reviews)
                  .HasForeignKey(r => r.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Bir kullanıcı aynı ürüne sadece bir yorum yapabilir
            entity.HasIndex(r => new { r.UserId, r.ProductId }).IsUnique();
        });
    }
}
