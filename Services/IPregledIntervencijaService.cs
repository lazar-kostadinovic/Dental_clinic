using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public interface IPregledIntervencijaService
    {
        PregledIntervencija Create(PregledIntervencija pregledIntervencija);
        List<PregledIntervencija> Get();
        PregledIntervencija Get(int id);
        void Remove(int id);
        void Update(int id, PregledIntervencija pregledIntervencija);
    }
}