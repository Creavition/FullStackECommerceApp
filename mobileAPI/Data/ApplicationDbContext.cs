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
    }
}
