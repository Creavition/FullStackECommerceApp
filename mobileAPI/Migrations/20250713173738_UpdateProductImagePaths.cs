using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace mobileAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductImagePaths : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FrontImageUrl",
                table: "Products",
                newName: "FrontImagePath");

            migrationBuilder.RenameColumn(
                name: "BackImageUrl",
                table: "Products",
                newName: "BackImagePath");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FrontImagePath",
                table: "Products",
                newName: "FrontImageUrl");

            migrationBuilder.RenameColumn(
                name: "BackImagePath",
                table: "Products",
                newName: "BackImageUrl");
        }
    }
}
