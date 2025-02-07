using Microsoft.EntityFrameworkCore;
using StomatoloskaOrdinacija.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StomatoloskaOrdinacija.Services
{
    public class StomatologService : IStomatologService
    {
        private readonly OrdinacijaDbContext _context;
        private readonly string _pepper;
        private readonly int _iteration;

        public StomatologService(OrdinacijaDbContext context, IConfiguration config)
        {
            _context = context;
            _pepper = config["PasswordHasher:Pepper"];
            _iteration = config.GetValue<int>("PasswordHasher:Iteration");
        }

        public Stomatolog Create(Stomatolog stomatolog)
        {
            _context.Stomatolozi.Add(stomatolog);
            _context.SaveChanges();
            return stomatolog;
        }

        public List<Stomatolog> Get()
        {
            return _context.Stomatolozi.ToList();
        }

        public Stomatolog Get(int? id)
        {
            return _context.Stomatolozi.FirstOrDefault(s => s.Id == id);
        }

        public async Task<Stomatolog> GetStomatologByEmailAsync(string email)
        {
            return await _context.Stomatolozi.FirstOrDefaultAsync(s => s.Email == email);
        }

        public List<Stomatolog> GetBySpecijalizacija(Specijalizacija specijalizacija)
        {
            return _context.Stomatolozi.Where(s => s.Specijalizacija == specijalizacija).ToList();
        }

        public Stomatolog GetAndUpdate(int? stomatologId, int pregledId)
        {
            var stomatolog = _context.Stomatolozi.Include(s => s.Pregledi)
                .FirstOrDefault(s => s.Id == stomatologId);

            if (stomatolog != null)
            {
                var pregled = _context.Pregledi.FirstOrDefault(p => p.Id == pregledId);

                if (pregled != null)
                {
                    stomatolog.Pregledi.Add(pregled);
                    _context.SaveChanges();
                }
                else
                {
                    throw new Exception($"Pregled sa ID {pregledId} nije pronađen.");
                }
            }

            return stomatolog;
        }


        public Stomatolog GetAndAddReview(int stomatologId, int pregledId)
        {
            var stomatolog = _context.Stomatolozi.Include(s => s.KomentariStomatologa)
                .FirstOrDefault(s => s.Id == stomatologId);

            if (stomatolog != null)
            {
                var ocenaStomatologa = _context.OceneStomatologa
                    .FirstOrDefault(o => o.IdStomatologa == stomatologId);

                if (ocenaStomatologa != null)
                {
                    stomatolog.KomentariStomatologa.Add(ocenaStomatologa);
                    _context.SaveChanges();
                }
                else
                {
                    throw new Exception($"Ocena stomatologa sa pregledom ID {pregledId} nije pronađena.");
                }
            }

            return stomatolog;
        }


        public void Remove(int id)
        {
            var stomatolog = _context.Stomatolozi.FirstOrDefault(s => s.Id == id);
            if (stomatolog != null)
            {
                _context.Stomatolozi.Remove(stomatolog);
                _context.SaveChanges();
            }
        }

        public void Update(int id, Stomatolog stomatolog)
        {
            var existingStomatolog = _context.Stomatolozi.FirstOrDefault(s => s.Id == id);
            if (existingStomatolog != null)
            {
                existingStomatolog.Ime = stomatolog.Ime;
                existingStomatolog.Prezime = stomatolog.Prezime;
                existingStomatolog.Slika = stomatolog.Slika;
                existingStomatolog.Adresa = stomatolog.Adresa;
                existingStomatolog.BrojTelefona = stomatolog.BrojTelefona;
                existingStomatolog.Specijalizacija = stomatolog.Specijalizacija;
                existingStomatolog.Role = stomatolog.Role;
                existingStomatolog.Email = stomatolog.Email;
                existingStomatolog.Password = stomatolog.Password;
                existingStomatolog.PasswordSalt = stomatolog.PasswordSalt;
                _context.SaveChanges();
            }
        }

        public async Task<bool> Register(RegistrationModelStomatolog resource)
        {
            var postojeciStomatolog = await _context.Stomatolozi.FirstOrDefaultAsync(x => x.Email == resource.Email);
            if (postojeciStomatolog != null)
            {
                throw new InvalidOperationException("Stomatolog sa ovom email adresom već postoji.");
            }

            var stomatolog = new Stomatolog
            {
                Ime = resource.Ime,
                Prezime = resource.Prezime,
                Slika = "default.jpg",
                Adresa = resource.Adresa,
                BrojTelefona = resource.BrojTelefona,
                Role = UserRole.Stomatolog,
                Specijalizacija = resource.Specijalizacija,
                Email = resource.Email,
                PasswordSalt = PasswordHasher.GenerateSalt(),
            };

            stomatolog.Password = PasswordHasher.ComputeHash(resource.Password, stomatolog.PasswordSalt, _pepper, _iteration);
            _context.Stomatolozi.Add(stomatolog);
            await _context.SaveChangesAsync();

            return true;
        }

        // public bool RemoveAppointment(int? stomatologId, int appointmentId)
        // {
        //     var stomatolog = _context.Stomatolozi.Include(s => s.Pregledi)
        //         .FirstOrDefault(s => s.Id == stomatologId);

        //     if (stomatolog != null)
        //     {
        //         var pregled = stomatolog.Pregledi.FirstOrDefault(p => p.Id == appointmentId);

        //         if (pregled != null)
        //         {
        //             stomatolog.Pregledi.Remove(pregled);
        //             _context.SaveChanges();
        //             return true;
        //         }
        //         else
        //         {
        //             throw new Exception($"Pregled sa ID {appointmentId} nije pronađen.");
        //         }
        //     }

        //     return false;
        // }

        public bool RemoveAppointment(int stomatologId, int pregledId)
        {
            var stomatolog = _context.Stomatolozi.Include(p => p.Pregledi).FirstOrDefault(p => p.Id == stomatologId);
            if (stomatolog != null && stomatolog.Pregledi != null)
            {
                var pregled = stomatolog.Pregledi.FirstOrDefault(p => p.Id == pregledId);
                if (pregled != null)
                {
                    stomatolog.Pregledi.Remove(pregled);
                    _context.SaveChanges();
                    return true;
                }
            }
            return false;
        }


        public bool SetDayOff(int stomatologId, DateTime dayOff)
        {
            var stomatolog = _context.Stomatolozi.FirstOrDefault(s => s.Id == stomatologId);
            if (stomatolog != null)
            {
                stomatolog.SlobodniDani.Add(dayOff.Date);
                _context.SaveChanges();
                return true;
            }
            return false;
        }

        public bool ChangeShift(int stomatologId)
        {
            var stomatolog = _context.Stomatolozi.FirstOrDefault(s => s.Id == stomatologId);
            if (stomatolog != null)
            {
                stomatolog.PrvaSmena = !stomatolog.PrvaSmena;
                _context.SaveChanges();
                return true;
            }

            throw new InvalidOperationException("Stomatolog sa datim ID-jem ne postoji.");
        }

        public bool SetDaysOff(int stomatologId, List<DateTime> daysOff)
        {
            var stomatolog = _context.Stomatolozi.FirstOrDefault(s => s.Id == stomatologId);
            if (stomatolog != null)
            {
                stomatolog.SlobodniDani.AddRange(daysOff.Select(d => d.Date));
                _context.SaveChanges();
                return true;
            }
            return false;
        }

        public List<Pregled> GetPreglediForStomatolog(int stomatologId)
        {
            var pregledi = _context.Pregledi
                .Where(p => p.IdStomatologa == stomatologId)
                .ToList();

            if (pregledi == null || pregledi.Count == 0)
            {
                throw new Exception($"Nema pregleda za stomatologa sa ID {stomatologId}.");
            }

            return pregledi;
        }
        public List<int> GetPreglediIdsForStomatolog(int stomatologId)
        {
            var pregledIds = _context.Pregledi
                .Where(p => p.IdStomatologa == stomatologId)
                .Select(p => p.Id)
                .ToList();

            return pregledIds.Count > 0 ? pregledIds : null;
        }

        public List<OcenaStomatologa> GetOceneForStomatolog(int stomatologId)
        {
            var ocene = _context.OceneStomatologa
                .Where(p => p.IdStomatologa == stomatologId)
                .ToList();

            return ocene.Count > 0 ? ocene : null;
        }

        public List<int> GetOceneIdsForStomatolog(int stomatologId)
        {
            var ocene = _context.OceneStomatologa
                .Where(p => p.IdStomatologa == stomatologId)
                .Select(p => p.Id)
                .ToList();

            return ocene.Count > 0 ? ocene : null;
        }


    }
}
