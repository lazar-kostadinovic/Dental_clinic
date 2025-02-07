using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public interface IStomatologService
    {
        List<Stomatolog> Get();
        Stomatolog Get(int? id);
        Task<Stomatolog> GetStomatologByEmailAsync(string email);
        List<Stomatolog> GetBySpecijalizacija(Specijalizacija specijalizacija);
        Stomatolog GetAndUpdate(int? stomatologId, int pregledId);
        Stomatolog GetAndAddReview(int stomatologId, int pregledId);
        Stomatolog Create(Stomatolog pacijent);
        void Update(int id, Stomatolog stomatolog);
        void Remove(int id);
        bool RemoveAppointment(int stomatologId, int appointmentId);
        Task<bool> Register(RegistrationModelStomatolog resource);
        bool SetDayOff(int stomatologId, DateTime day);
        bool ChangeShift(int stomatologId);
        bool SetDaysOff(int stomatologId, List<DateTime> daysOff);
        List<Pregled> GetPreglediForStomatolog(int stomatologId);
        List<int> GetPreglediIdsForStomatolog(int stomatologId);
        List<OcenaStomatologa> GetOceneForStomatolog(int stomatologId);
        List<int> GetOceneIdsForStomatolog(int stomatologId);

    }
}