using StomatoloskaOrdinacija.Models;
using MongoDB.Bson;

namespace StomatoloskaOrdinacija.Services
{
    public interface ITipIntervencijeService
    {
        List<TipIntervencije> Get();
        TipIntervencije Get(ObjectId id);
        TipIntervencije Create(TipIntervencije intervencija);
        void Update(ObjectId id, TipIntervencije intervencija);
        void Remove(ObjectId id);

    }
}