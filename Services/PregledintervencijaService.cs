using Microsoft.EntityFrameworkCore;
using StomatoloskaOrdinacija.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace StomatoloskaOrdinacija.Services
{
    public class PregledIntervencijaService(OrdinacijaDbContext context) : IPregledIntervencijaService
    {
        private readonly OrdinacijaDbContext _context = context;

        public PregledIntervencija Create(PregledIntervencija pregledIntervencija)
        {
            _context.PreglediIntervencije.Add(pregledIntervencija);
            _context.SaveChanges();
            return pregledIntervencija;
        }

        public List<PregledIntervencija> Get()
        {
            return _context.PreglediIntervencije.Include(pi => pi.Pregled).Include(pi => pi.Intervencija).ToList();
        }

        public PregledIntervencija Get(int id)
        {
            return _context.PreglediIntervencije.Include(pi => pi.Pregled).Include(pi => pi.Intervencija).FirstOrDefault(pi => pi.Id == id);
        }

        public void Remove(int id)
        {
            var pregledIntervencija = _context.PreglediIntervencije.FirstOrDefault(pi => pi.Id == id);
            if (pregledIntervencija != null)
            {
                _context.PreglediIntervencije.Remove(pregledIntervencija);
                _context.SaveChanges();
            }
        }

        public void Update(int id, PregledIntervencija pregledIntervencija)
        {
            var existingPregledIntervencija = _context.PreglediIntervencije.FirstOrDefault(pi => pi.Id == id);
            if (existingPregledIntervencija != null)
            {
                existingPregledIntervencija.Kolicina = pregledIntervencija.Kolicina;
                _context.SaveChanges();
            }
        }
    }
}
