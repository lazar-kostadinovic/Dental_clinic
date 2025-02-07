using StomatoloskaOrdinacija.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace StomatoloskaOrdinacija.Services
{
    public class PregledService : IPregledService
    {
        private readonly OrdinacijaDbContext _context;


        public PregledService(OrdinacijaDbContext context)
        {
            _context = context;
        }

        public Pregled Create(Pregled pregled)
        {
            _context.Pregledi.Add(pregled);
            _context.SaveChanges();
            return pregled;
        }

        public List<Pregled> Get()
        {
            return _context.Pregledi.ToList();
        }

        public Pregled Get(int id)
        {
            return _context.Pregledi.FirstOrDefault(p => p.Id == id);
        }

        public List<Pregled> GetByStomatologId(int stomatologId)
        {
            return _context.Pregledi.Where(p => p.IdStomatologa == stomatologId).ToList();
        }

        public List<Pregled> GetByPacijentId(int pacijentId)
        {
            return _context.Pregledi.Where(p => p.IdPacijenta == pacijentId).ToList();
        }

        public void Remove(int id)
        {
            var pregled = _context.Pregledi.FirstOrDefault(p => p.Id == id);
            if (pregled != null)
            {
                _context.Pregledi.Remove(pregled);
                _context.SaveChanges();
            }
        }

        public void Update(int id, Pregled pregled)
        {
            var existingPregled = _context.Pregledi.FirstOrDefault(p => p.Id == id);
            if (existingPregled != null)
            {
                existingPregled.Datum = pregled.Datum;
                existingPregled.Opis = pregled.Opis;
                existingPregled.Naplacen = pregled.Naplacen;
                existingPregled.Status = pregled.Status;
                existingPregled.PregledIntervencije = pregled.PregledIntervencije;
                existingPregled.UkupnaCena = pregled.UkupnaCena;
                existingPregled.IdStomatologa = pregled.IdStomatologa;
                existingPregled.EmailPacijenta = pregled.EmailPacijenta;
                _context.SaveChanges();
            }
        }

        public void UpdatePregledStatuses()
        {
            var pregledi = _context.Pregledi.Where(p => p.Datum < DateTime.UtcNow && p.Status == StatusPregleda.Predstojeci).ToList();
            foreach (var pregled in pregledi)
            {
                pregled.Status = StatusPregleda.Prosli;
            }
            _context.SaveChanges();
        }

        public List<Pregled> GetStomatologAppointmentsInDateRange(int idStomatologa, DateTime startDate, DateTime endDate)
        {
            return _context.Pregledi.Where(p => p.IdStomatologa == idStomatologa && p.Datum >= startDate && p.Datum <= endDate).ToList();
        }

        public List<Pregled> GetAppointmentsInDateRange(DateTime startDate, DateTime endDate)
        {
            return _context.Pregledi.Where(p => p.Datum >= startDate && p.Datum <= endDate).ToList();
        }

        public List<Pregled> GetUnconfirmedAppointments()
        {
            return _context.Pregledi.Where(p => p.IdStomatologa == null).ToList();
        }

        // public List<Intervencija> GetIntervencijeZaPregled(int pregledId)
        // {
        //     var pregledIntervencije = _context.PreglediIntervencije
        //         .Where(pi => pi.PregledId == pregledId)
        //         .ToList();

        //     var intervencijeIds = pregledIntervencije
        //         .Select(pi => pi.IntervencijaId)
        //         .ToList();

        //     var intervencije = _context.Intervencije
        //         .Where(i => intervencijeIds.Contains(i.Id))
        //         .ToList();

        //     return intervencije;
        // }
        public List<PregledIntervencijaDTO> GetIntervencijeZaPregled(int pregledId)
        {
            var intervencijeZaPregled = _context.PreglediIntervencije
                .Where(pi => pi.PregledId == pregledId)
                .Select(pi => new PregledIntervencijaDTO
                {
                    Id = pi.Intervencija.Id,
                    Naziv = pi.Intervencija.Naziv,
                    Cena = pi.Intervencija.Cena,
                    Kolicina = pi.Kolicina
                })
                .ToList();

            return intervencijeZaPregled;
        }

    }
}
