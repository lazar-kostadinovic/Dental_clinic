using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace StomatoloskaOrdinacija.Models
{

    public class OcenaStomatologa
    {
        [Key]
        public int Id { get; set; }
        public int IdStomatologa { get; set; }
        public int IdPacijenta { get; set; }
        public DateTime Datum { get; set; }
        public string Komentar { get; set; }
        public int Ocena { get; set; }

        [ForeignKey("IdStomatologa")]
        public Stomatolog Stomatolog { get; set; }

        [ForeignKey("IdPacijenta")]
        public Pacijent Pacijent { get; set; }
    }
}




