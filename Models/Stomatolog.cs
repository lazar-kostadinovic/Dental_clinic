using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StomatoloskaOrdinacija.Models
{

    public class Stomatolog
    {
        [Key]
        public int Id { get; set; }
        public string Slika { get; set; }
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public string Adresa { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string PasswordSalt { get; set; }
        public string BrojTelefona { get; set; }
        public UserRole Role { get; set; }
        public Specijalizacija Specijalizacija { get; set; }
        public bool PrvaSmena { get; set; } = true;
        public int BrojPregleda { get; set; }
        public int UkupanBrojPregleda { get; set; }
        public List<DateTime> SlobodniDani { get; set; } = new List<DateTime>();
        [JsonIgnore]
        public List<Pregled> Pregledi { get; set; } = new List<Pregled>();
        [JsonIgnore]
        public List<OcenaStomatologa> KomentariStomatologa { get; set; } = new List<OcenaStomatologa>();
    }


    public enum Specijalizacija
    {
        OralniHirurg,
        Ortodontija,
        Parodontologija,
        Endodoncija,
        PedijatrijskaStomatologija,
        Protetika,
        EstetskaStomatologija,
        OpstaStomatologija,
    }
}