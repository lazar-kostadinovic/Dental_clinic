using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StomatoloskaOrdinacija.Models
{
   public class Intervencija
    {
        [Key]
        public int Id { get; set; }
        public string Naziv { get; set; }
        public int Cena { get; set; }
        [JsonIgnore]
        public List<PregledIntervencija> PregledIntervencije { get; set; } = new List<PregledIntervencija>();
    }
}
