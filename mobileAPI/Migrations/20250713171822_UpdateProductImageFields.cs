using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace mobileAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductImageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "Products",
                newName: "FrontImageUrl");

            migrationBuilder.AddColumn<string>(
                name: "BackImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackImageUrl",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "FrontImageUrl",
                table: "Products",
                newName: "ImageUrl");
        }
    }
}
