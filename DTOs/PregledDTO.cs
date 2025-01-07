namespace StomatoloskaOrdinacija.DTOs
{
    public class PregledDTO
    {
        public string Id { get; set; }
        public string IdStomatologa { get; set; }
        public string IdPacijenta { get; set; }
        public string PacijentEmail { get; set; }
        public DateTime Datum { get; set; }
        public bool Naplacen { get; set; }
        public string Opis { get; set; }
        public StatusPregleda Status { get; set; }
        public List<Intervencija> Intervencije { get; set; }
        public int UkupnaCena { get; set; }
    }
}

