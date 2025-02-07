using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public interface IOcenaStomatologaService
    {
        List<OcenaStomatologa> Get();
        OcenaStomatologa Get(int id);
        OcenaStomatologa Create(OcenaStomatologa ocena);
        void Update(int id, OcenaStomatologa ocena);
        void Remove(int id);
        List<OcenaStomatologa> GetReviews(int idStomatologa);
    }
}