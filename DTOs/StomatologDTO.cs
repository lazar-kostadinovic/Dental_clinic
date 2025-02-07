using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.DTOs
{
    public class StomatologDTO
    {
        public string Id { get; set; }
        public string Slika { get; set; }
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public string Adresa { get; set; }
        public string Email { get; set; }
        public string BrojTelefona { get; set; }
        public bool PrvaSmena { get; set; }
        public int BrojPregleda { get; set; }
        public int UkupanBrojPregleda { get; set; }
        public UserRole Role { get; set; }
        public Specijalizacija Specijalizacija { get; set; }
        public List<int> Pregledi { get; set; } = new List<int>();
        public List<Pregled> PreglediObj { get; set; }
        public List<int> KomentariStomatologa { get; set; } = new List<int>();
        public List<OcenaStomatologa> KomentariStomatologObj { get; set; }
        public List<DateTime> SlobodniDani { get; set; }
    }
}
