using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StomatoloskaOrdinacija.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pregledi_Pacijenti_PacijentId",
                table: "Pregledi");

            migrationBuilder.DropIndex(
                name: "IX_Pregledi_PacijentId",
                table: "Pregledi");

            migrationBuilder.DropColumn(
                name: "PacijentId",
                table: "Pregledi");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PacijentId",
                table: "Pregledi",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pregledi_PacijentId",
                table: "Pregledi",
                column: "PacijentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pregledi_Pacijenti_PacijentId",
                table: "Pregledi",
                column: "PacijentId",
                principalTable: "Pacijenti",
                principalColumn: "Id");
        }
    }
}
