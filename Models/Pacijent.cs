using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StomatoloskaOrdinacija.Models
{
    public class Pacijent
    {
        [Key]
        public int Id { get; set; }
        public string Slika { get; set; }
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public int Godine { get; set; }
        public DateTime DatumRodjenja { get; set; }
        public string Adresa { get; set; }
        public string BrojTelefona { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string PasswordSalt { get; set; }
        public decimal UkupnoPotroseno { get; set; } = 0;
        public int BrojNedolazaka { get; set; } = 0;
        public decimal Dugovanje { get; set; } = 0;
        public UserRole Role { get; set; }
        [JsonIgnore]
        public List<OcenaStomatologa> KomentariPacijenta { get; set; } = new List<OcenaStomatologa>();
        public List<Pregled> Pregledi { get; set; } = [];
    }


    public enum UserRole
    {
        Pacijent,
        Stomatolog,
        Administrator
    }
}