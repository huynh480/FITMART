using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitmart.API.Migrations
{
    /// <inheritdoc />
    public partial class AddColorNameToProductImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ColorName",
                table: "ProductImages",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorName",
                table: "ProductImages");
        }
    }
}
