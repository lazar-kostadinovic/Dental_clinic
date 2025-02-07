using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public interface IIntervencijaService
    {
        List<Intervencija> Get();
        Intervencija Get(int id);
        Intervencija Create(Intervencija intervencija);
        void Update(int id, Intervencija intervencija);
        void Remove(int id);

    }
}