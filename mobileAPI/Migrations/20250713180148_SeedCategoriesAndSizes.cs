using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace mobileAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedCategoriesAndSizes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed Categories
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CategoryName" },
                values: new object[,]
                {
                    { 1, "Jacket" },
                    { 2, "Pants" },
                    { 3, "Shoes" },
                    { 4, "T-Shirt" }
                });

            // Seed Sizes
            migrationBuilder.InsertData(
                table: "Sizes",
                columns: new[] { "Id", "SizeName", "CategoryId" },
                values: new object[,]
                {
                    // Jacket sizes
                    { 1, "S", 1 },
                    { 2, "M", 1 },
                    { 3, "L", 1 },
                    { 4, "XL", 1 },
                    
                    // Pants sizes
                    { 5, "28", 2 },
                    { 6, "30", 2 },
                    { 7, "32", 2 },
                    { 8, "34", 2 },
                    { 9, "36", 2 },
                    
                    // Shoes sizes
                    { 10, "40", 3 },
                    { 11, "41", 3 },
                    { 12, "42", 3 },
                    { 13, "43", 3 },
                    { 14, "44", 3 },
                    
                    // T-Shirt sizes
                    { 15, "S", 4 },
                    { 16, "M", 4 },
                    { 17, "L", 4 },
                    { 18, "XL", 4 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove seeded data
            migrationBuilder.DeleteData(table: "Sizes", keyColumn: "Id", keyValues: new object[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 });
            migrationBuilder.DeleteData(table: "Categories", keyColumn: "Id", keyValues: new object[] { 1, 2, 3, 4 });
        }
    }
}
