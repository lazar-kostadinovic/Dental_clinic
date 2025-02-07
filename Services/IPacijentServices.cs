using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public interface IPacijentService
    {
        List<Pacijent> Get();
        Pacijent Get(int id);
        Task<Pacijent> GetPacijentByEmailAsync(string email);
        Pacijent GetAndUpdate(int pacijentId, int pregledId);
        Pacijent Create(Pacijent pacijent);
        void Update(int id, Pacijent pacijent);
        void Remove(int id);
        bool RemoveAppointment(int pacijentId, int appointmentId);
        Task<bool> Register(RegistrationModel resource);
        bool AddOrUpdateSlika(int pacijentId, string slikaFileName);
        Task<string> GetEmailByIdAsync(int id);
        List<Pregled> GetPreglediForPacijent(int pacijentid);
        List<int> GetPreglediIdsForPacijent(int pacijentid);
    }
}