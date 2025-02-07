using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public interface IPregledService
    {
        List<Pregled> Get();
        Pregled Get(int id);
        List<Pregled> GetByStomatologId(int stomatologId);
        List<Pregled> GetByPacijentId(int pacijentId);
        Pregled Create(Pregled pregled);
        void Update(int id, Pregled pregled);
        void UpdatePregledStatuses();
        void Remove(int id);
        List<Pregled> GetStomatologAppointmentsInDateRange(int idStomatologa, DateTime startDate, DateTime endDate);
        List<Pregled> GetAppointmentsInDateRange(DateTime startDate, DateTime endDate);
        List<Pregled> GetUnconfirmedAppointments();
        List<PregledIntervencijaDTO> GetIntervencijeZaPregled(int pregledId);

    }
}