
using Microsoft.EntityFrameworkCore;
using StomatoloskaOrdinacija.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace StomatoloskaOrdinacija.Services
{
    public class IntervencijaService : IIntervencijaService
    {
        private readonly OrdinacijaDbContext _context;

        public IntervencijaService(OrdinacijaDbContext context)
        {
            _context = context;
        }

        public Intervencija Create(Intervencija intervencija)
        {
            _context.Intervencije.Add(intervencija);
            _context.SaveChanges();
            return intervencija;
        }

        public List<Intervencija> Get()
        {
            return _context.Intervencije.Include(i => i.PregledIntervencije).ToList();
        }

        public Intervencija Get(int id)
        {
            return _context.Intervencije.Include(i => i.PregledIntervencije).FirstOrDefault(i => i.Id == id);
        }

        public void Remove(int id)
        {
            var intervencija = _context.Intervencije.FirstOrDefault(i => i.Id == id);
            if (intervencija != null)
            {
                _context.Intervencije.Remove(intervencija);
                _context.SaveChanges();
            }
        }

        public void Update(int id, Intervencija intervencija)
        {
            var existingIntervencija = _context.Intervencije.FirstOrDefault(i => i.Id == id);
            if (existingIntervencija != null)
            {
                existingIntervencija.Naziv = intervencija.Naziv;
                existingIntervencija.Cena = intervencija.Cena;
                _context.SaveChanges();
            }
        }
    }
}
