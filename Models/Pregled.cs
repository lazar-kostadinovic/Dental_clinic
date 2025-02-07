using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace StomatoloskaOrdinacija.Models
{
    public class Pregled
    {
        [Key]
        public int Id { get; set; }

        public int? IdStomatologa { get; set; }
        public int IdPacijenta { get; set; }
        public string EmailPacijenta { get; set; }
        public DateTime Datum { get; set; }
        public string Opis { get; set; }
        public bool Naplacen { get; set; } = false;
        public StatusPregleda Status { get; set; }
        public int UkupnaCena { get; set; }

        [ForeignKey("IdPacijenta")]
        public Pacijent Pacijent { get; set; }

        [ForeignKey("IdStomatologa")]
        public Stomatolog Stomatolog { get; set; } 
        [JsonIgnore]
        public List<PregledIntervencija> PregledIntervencije { get; set; } = new List<PregledIntervencija>();
    }

    public enum StatusPregleda
    {
        Predstojeci,
        Prosli,
        Otkazani
    }
}
