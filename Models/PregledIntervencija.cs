using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StomatoloskaOrdinacija.Models
{
        public class PregledIntervencija
    {
        [Key]
        public int Id { get; set; }
        public int PregledId { get; set; }
        public int IntervencijaId { get; set; }
        public int Kolicina { get; set; }

        [ForeignKey("PregledId")]
        public Pregled Pregled { get; set; }
        
        [ForeignKey("IntervencijaId")]
        public Intervencija Intervencija { get; set; }
    }

}
