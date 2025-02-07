using StomatoloskaOrdinacija.Models;

public class ChargeAppointmentRequest
{
    public List<PregledIntervencijaRequest> Intervencije { get; set; } = new List<PregledIntervencijaRequest>();
    public int UkupnaCena { get; set; }
}

public class PregledIntervencijaRequest
{
    public int IntervencijaId { get; set; }
    public int Kolicina { get; set; }
}
