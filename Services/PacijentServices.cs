using Microsoft.EntityFrameworkCore;
using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public class PacijentService : IPacijentService
    {
        private readonly OrdinacijaDbContext _context;
        private readonly string _pepper;
        private readonly int _iteration;

        public PacijentService(OrdinacijaDbContext context, IConfiguration config)
        {
            _context = context;
            _pepper = config["PasswordHasher:Pepper"];
            _iteration = config.GetValue<int>("PasswordHasher:Iteration");
        }

        public Pacijent Create(Pacijent pacijent)
        {
            _context.Pacijenti.Add(pacijent);
            _context.SaveChanges();
            return pacijent;
        }

        public List<Pacijent> Get()
        {
            return _context.Pacijenti.ToList();
        }

        public Pacijent Get(int id)
        {
            return _context.Pacijenti.Find(id);
        }

        public async Task<Pacijent> GetPacijentByEmailAsync(string email)
        {
            return await _context.Pacijenti.FirstOrDefaultAsync(p => p.Email == email);
        }

        public void Remove(int id)
        {
            var pacijent = _context.Pacijenti.Find(id);
            if (pacijent != null)
            {
                _context.Pacijenti.Remove(pacijent);
                _context.SaveChanges();
            }
        }

        public void Update(int id, Pacijent pacijent)
        {
            var existingPacijent = _context.Pacijenti.Find(id);
            if (existingPacijent != null)
            {
                _context.Entry(existingPacijent).CurrentValues.SetValues(pacijent);
                _context.SaveChanges();
            }
        }

        public async Task<bool> Register(RegistrationModel resource)
        {
            var postojeciPacijent = await _context.Pacijenti.FirstOrDefaultAsync(x => x.Email == resource.Email);
            if (postojeciPacijent != null)
            {
                throw new InvalidOperationException("Pacijent sa ovom email adresom već postoji.");
            }

            int godine = DateTime.Now.Year - resource.DatumRodjenja.Year;
            if (DateTime.Now.Date < resource.DatumRodjenja.Date.AddYears(godine))
            {
                godine--;
            }

            var pacijent = new Pacijent
            {
                Ime = resource.Ime,
                Prezime = resource.Prezime,
                DatumRodjenja = resource.DatumRodjenja,
                Godine = godine,
                Slika = "default.jpg",
                Adresa = resource.Adresa,
                BrojTelefona = resource.BrojTelefona,
                Role = UserRole.Pacijent,
                Email = resource.Email,
                PasswordSalt = PasswordHasher.GenerateSalt(),
            };
            pacijent.Password = PasswordHasher.ComputeHash(resource.Password, pacijent.PasswordSalt, _pepper, _iteration);

            _context.Pacijenti.Add(pacijent);
            await _context.SaveChangesAsync();

            return true;
        }

        public bool RemoveAppointment(int pacijentId, int pregledId)
        {
            var pacijent = _context.Pacijenti.Include(p => p.Pregledi).FirstOrDefault(p => p.Id == pacijentId);
            if (pacijent != null && pacijent.Pregledi != null)
            {
                var pregled = pacijent.Pregledi.FirstOrDefault(p => p.Id == pregledId);
                if (pregled != null)
                {
                    pacijent.Pregledi.Remove(pregled);
                    _context.SaveChanges();
                    return true;
                }
            }
            return false;
        }

        public bool AddOrUpdateSlika(int pacijentId, string slikaFileName)
        {
            var pacijent = _context.Pacijenti.Find(pacijentId);
            if (pacijent != null)
            {
                pacijent.Slika = slikaFileName;
                _context.SaveChanges();
                return true;
            }
            return false;
        }

        public async Task<string> GetEmailByIdAsync(int id)
        {
            var pacijent = await _context.Pacijenti.FindAsync(id);
            return pacijent?.Email;
        }

        public Pacijent GetAndUpdate(int pacijentId, int pregledId)
        {
            var pacijent = _context.Pacijenti.Include(s => s.Pregledi)
                .FirstOrDefault(s => s.Id == pacijentId);

            if (pacijent != null)
            {
                var pregled = _context.Pregledi.FirstOrDefault(p => p.Id == pregledId);

                if (pregled != null)
                {
                    pacijent.Pregledi.Add(pregled);
                    _context.SaveChanges();
                }
                else
                {
                    throw new Exception($"Pregled sa ID {pregledId} nije pronađen.");
                }
            }

            return pacijent;
        }

         public List<Pregled> GetPreglediForPacijent(int pacijentid)
        {
            var pregledi = _context.Pregledi
                .Where(p => p.IdPacijenta == pacijentid)
                .ToList();

            if (pregledi == null || pregledi.Count == 0)
            {
                throw new Exception($"Nema pregleda za pacijenta sa ID {pacijentid}.");
            }

            return pregledi;
        }
        public List<int> GetPreglediIdsForPacijent(int pacijentid)
        {
            var pregledIds = _context.Pregledi
                .Where(p => p.IdPacijenta == pacijentid)
                .Select(p => p.Id) 
                .ToList();

          return pregledIds.Count > 0 ? pregledIds : null;
        }

    }
}
