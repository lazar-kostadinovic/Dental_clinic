using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public class OcenaStomatologaService : IOcenaStomatologaService
    {
        private readonly OrdinacijaDbContext _context;

        public OcenaStomatologaService(OrdinacijaDbContext context)
        {
            _context = context;
        }

        public OcenaStomatologa Create(OcenaStomatologa ocena)
        {
            _context.OceneStomatologa.Add(ocena);
            _context.SaveChanges();
            return ocena;
        }

        public List<OcenaStomatologa> Get()
        {
            return _context.OceneStomatologa.ToList();
        }

        public OcenaStomatologa Get(int id)
        {
            return _context.OceneStomatologa.Find(id);
        }

        public void Remove(int id)
        {
            var ocena = _context.OceneStomatologa.Find(id);
            if (ocena != null)
            {
                _context.OceneStomatologa.Remove(ocena);
                _context.SaveChanges();
            }
        }

        public void Update(int id, OcenaStomatologa novaOcena)
        {
            var existingOcena = _context.OceneStomatologa.Find(id);
            if (existingOcena != null)
            {
                _context.Entry(existingOcena).CurrentValues.SetValues(novaOcena);
                _context.SaveChanges();
            }
        }

        public List<OcenaStomatologa> GetReviews(int idStomatologa)
        {
            return _context.OceneStomatologa
                .Where(ocena => ocena.IdStomatologa == idStomatologa)
                .ToList();
        }
    }
}
