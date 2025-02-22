using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StomatoloskaOrdinacija.DTOs;

namespace StomatoloskaOrdinacija.Controllers;
[Authorize]
[ApiController]
[Route("[controller]")]
public class StomatologController(IStomatologService stomatologService, IPacijentService pacijentService, IPregledService pregledService) : ControllerBase
{
    private readonly IStomatologService stomatologService = stomatologService;
    private readonly IPacijentService pacijentService = pacijentService;
    private readonly IPregledService pregledService = pregledService;

    [AllowAnonymous]
    [HttpGet]
    public ActionResult<List<Stomatolog>> Get()
    {
        return stomatologService.Get();
    }
    [AllowAnonymous]
    [HttpGet("getDTOs")]
    public ActionResult<StomatologDTO> GetStomatologDTOs()
    {
        var stomatolozi = stomatologService.Get();

        if (stomatolozi == null)
        {
            return NotFound("Nema stomatologa u sistemu.");
        }

        var stomatoloziDTO = stomatolozi.Select(stomatolog => new StomatologDTO
        {
            Id = stomatolog.Id.ToString(),
            Slika = stomatolog.Slika,
            Ime = stomatolog.Ime,
            Prezime = stomatolog.Prezime,
            Adresa = stomatolog.Adresa,
            Email = stomatolog.Email,
            BrojTelefona = stomatolog.BrojTelefona,
            Role = stomatolog.Role,
            PrvaSmena = stomatolog.PrvaSmena,
            Specijalizacija = stomatolog.Specijalizacija,
            BrojPregleda = stomatolog.BrojPregleda,
            // Pregledi = stomatolog.Pregledi.Select(p => p.ToString()).ToList(),
            // KomentariStomatologa = stomatolog.KomentariStomatologa.Select(k => k.ToString()).ToList()
            Pregledi = stomatologService.GetPreglediIdsForStomatolog(stomatolog.Id),
            KomentariStomatologa = stomatologService.GetOceneIdsForStomatolog(stomatolog.Id),
        }).ToList();

        return Ok(stomatoloziDTO);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public ActionResult<Stomatolog> Get(int id)
    {
        var stomatolog = stomatologService.Get(id);

        if (stomatolog == null)
        {
            return NotFound($"Stomatolog with Id = {id} not found");
        }

        return stomatolog;
    }

    [AllowAnonymous]
    [HttpGet("getStomatologDTO/{id}")]
    public ActionResult<StomatologDTO> GetStomatologById(string id)
    {
        if (!int.TryParse(id, out var objectId))
        {
            return BadRequest("Invalid ObjectId format.");
        }

        var stomatolog = stomatologService.Get(objectId);

        if (stomatolog == null)
        {
            return NotFound($"Stomatolog with Id = {id} not found");
        }

        var stomatologDTO = new StomatologDTO
        {
            Id = stomatolog.Id.ToString(),
            Slika = stomatolog.Slika,
            Ime = stomatolog.Ime,
            Prezime = stomatolog.Prezime,
            Adresa = stomatolog.Adresa,
            Email = stomatolog.Email,
            BrojTelefona = stomatolog.BrojTelefona,
            Role = stomatolog.Role,
            Specijalizacija = stomatolog.Specijalizacija,
            // Pregledi = stomatolog.Pregledi.Select(p => p.ToString()).ToList(),
            // KomentariStomatologa = stomatolog.KomentariStomatologa.Select(k => k.ToString()).ToList()
            Pregledi = stomatologService.GetPreglediIdsForStomatolog(stomatolog.Id),
            KomentariStomatologa = stomatologService.GetOceneIdsForStomatolog(stomatolog.Id),
        };

        return stomatologDTO;
    }

    [AllowAnonymous]
    [HttpGet("GetStomatologByEmail/{email}")]
    public async Task<IActionResult> GetStomatologByEmail(string email)
    {
        var stomatolog = await stomatologService.GetStomatologByEmailAsync(email);

        if (stomatolog == null)
        {
            return NotFound($"Stomatolog with email = {email} not found");
        }
        var stomatologDTO = new StomatologDTO
        {
            Id = stomatolog.Id.ToString(),
            Slika = stomatolog.Slika,
            Ime = stomatolog.Ime,
            Prezime = stomatolog.Prezime,
            BrojTelefona = stomatolog.BrojTelefona,
            Adresa = stomatolog.Adresa,
            Email = stomatolog.Email,
            Role = stomatolog.Role,
            PrvaSmena = stomatolog.PrvaSmena,
            BrojPregleda = stomatolog.BrojPregleda,
            Specijalizacija = stomatolog.Specijalizacija,
            // KomentariStomatologa = stomatolog.KomentariStomatologa.Select(id => id.ToString()).ToList(),
            // Pregledi = stomatolog.Pregledi.Select(id => id.ToString()).ToList(),
            Pregledi = stomatologService.GetPreglediIdsForStomatolog(stomatolog.Id),
            KomentariStomatologa = stomatologService.GetOceneIdsForStomatolog(stomatolog.Id),

        };

        return Ok(stomatologDTO);
    }

    [AllowAnonymous]
    [HttpGet("BySpecijalizacija/{specijalizacija}")]
    public ActionResult<List<Stomatolog>> GetBySpecijalizacija(Specijalizacija specijalizacija)
    {
        var stomatoloziBySpecijalizacija = stomatologService.GetBySpecijalizacija(specijalizacija);

        if (stomatoloziBySpecijalizacija.Count == 0)
        {
            return NotFound($"Stomatolog sa specijalizacijom = {specijalizacija} nije pronadjen");
        }

        return stomatoloziBySpecijalizacija;
    }

    [HttpPost("{ime}/{prezime}/{adresa}/{brojTelefona}/{email}/{specijalizacija}")]
    public ActionResult<Stomatolog> Post(string ime, string prezime, string adresa, string brojTelefona, string email, Specijalizacija specijalizacija)
    {
        var stomatolog = new Stomatolog
        {
            Ime = ime,
            Prezime = prezime,
            Adresa = adresa,
            BrojTelefona = brojTelefona,
            Email = email,
            Specijalizacija = specijalizacija
        };
        stomatologService.Create(stomatolog);

        return CreatedAtAction(nameof(Get), new { id = stomatolog.Id }, stomatolog);
    }

    [HttpPut("changeEmail/{id}/{newEmail}")]
    public ActionResult ChangeEmail(int id, string newEmail)
    {
        var stomatolog = stomatologService.Get(id);
        if (stomatolog == null)
        {
            return NotFound($"Stomatolog with id = {id} not found");
        }

        stomatolog.Email = newEmail;

        stomatologService.Update(stomatolog.Id, stomatolog);

        return NoContent();
    }

    [HttpPut("changeAddress/{id}/{adresa}")]
    public ActionResult ChangeAddress(int id, string adresa)
    {
        var stomatolog = stomatologService.Get(id);
        if (stomatolog == null)
        {
            return NotFound($"Stomatolog with id = {id} not found");
        }

        stomatolog.Adresa = adresa;

        stomatologService.Update(stomatolog.Id, stomatolog);

        return NoContent();
    }

    [HttpPut("changeNumber/{id}/{brojTelefona}")]
    public ActionResult ChangeNumber(int id, string brojTelefona)
    {
        var stomatolog = stomatologService.Get(id);
        if (stomatolog == null)
        {
            return NotFound($"Stomatolog with id = {id} not found");
        }

        stomatolog.BrojTelefona = brojTelefona;

        stomatologService.Update(stomatolog.Id, stomatolog);

        return NoContent();
    }

    [AllowAnonymous]
    [HttpPost("uploadSlika/{id}")]
    public IActionResult UploadSlika(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is empty.");
        }

        var dentist = stomatologService.Get(id);
        if (dentist == null)
        {
            return NotFound($"Pacijent with Id = {id} not found.");
        }

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine("wwwroot", "assets", fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            file.CopyTo(stream);
        }

        dentist.Slika = fileName;
        stomatologService.Update(dentist.Id, dentist);

        return Ok(new { fileName });
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        var stomatolog = stomatologService.Get(id);

        if (stomatolog == null)
        {
            return NotFound(new { message = $"Stomatolog with Id = {id} not found" });
        }

        var pregledi = pregledService.GetByStomatologId(id);

        foreach (var pregled in pregledi)
        {
           
            pregledService.Remove(pregled.Id);
        }

        stomatologService.Remove(stomatolog.Id);

        return Ok(new { message = $"Stomatolog with Id = {id} and all associated appointments deleted" });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegistrationModelStomatolog resource)
    {
        try
        {
            var stomatolog = await stomatologService.GetStomatologByEmailAsync(resource.Email);
            var pacijent = await pacijentService.GetPacijentByEmailAsync(resource.Email);

            if (stomatolog != null)
            {
                return BadRequest($"Stomatolog sa ovom e-mail adresom vec postoji.");
            }
            else if (pacijent != null)
            {
                return BadRequest($"Pacijent sa ovom e-mail adresom vec postoji.");
            }

            var response = await stomatologService.Register(resource);
            return Ok(new { message = "Uspešno registrovan nalog." });
        }
        catch (Exception e)
        {
            return BadRequest(new { ErrorMessage = e.Message });
        }
    }

    [HttpPost("addDayOff/{idStomatologa}/{datum}")]
    public IActionResult AddDayOff(int idStomatologa, DateTime datum)
    {
        try
        {
            var stomatolog = stomatologService.Get(idStomatologa);
            if (stomatolog == null)
            {
                return NotFound($"Stomatolog with Id = {idStomatologa} not found");
            }

            datum = DateTime.SpecifyKind(datum.Date, DateTimeKind.Utc);

            if (stomatolog.SlobodniDani.Contains(datum))
            {
                return BadRequest("You already set this day off");
            }

            if (!stomatologService.SetDayOff(idStomatologa, datum))
            {
                return BadRequest($"Unable to add day off for stomatolog with Id = {idStomatologa}.");
            }

            return Ok(new { message = $"Day off on {datum.ToShortDateString()} added for stomatolog with Id = {idStomatologa}." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("addDaysOff/{idStomatologa}/{pocetniDatum}/{krajnjiDatum}")]
    public IActionResult AddDaysOff(int idStomatologa, DateTime pocetniDatum, DateTime krajnjiDatum)
    {
        try
        {
            var stomatolog = stomatologService.Get(idStomatologa);
            if (stomatolog == null)
            {
                return NotFound($"Stomatolog with Id = {idStomatologa} not found");
            }

            pocetniDatum = DateTime.SpecifyKind(pocetniDatum.Date, DateTimeKind.Utc);
            krajnjiDatum = DateTime.SpecifyKind(krajnjiDatum.Date, DateTimeKind.Utc);

            if (pocetniDatum > krajnjiDatum)
            {
                return BadRequest("Pocetni datum ne moze da bude veci od krajnjeg.");
            }

            var daniZaDodavanje = Enumerable.Range(0, (krajnjiDatum - pocetniDatum).Days + 1)
                                             .Select(offset => pocetniDatum.AddDays(offset))
                                             .ToList();

            var postojeceSlobodniDani = stomatolog.SlobodniDani.Intersect(daniZaDodavanje).ToList();

            if (postojeceSlobodniDani.Any())
            {
                return BadRequest($"Neki neradni dani su vec bili dodati {string.Join(", ", postojeceSlobodniDani.Select(d => d.ToShortDateString()))}");
            }

            if (!stomatologService.SetDaysOff(idStomatologa, daniZaDodavanje))
            {
                return BadRequest($"Greska prilikom dodavanja neradnih dana.");
            }

            return Ok(new { message = $"Dodati neradni dani od {pocetniDatum.ToShortDateString()} do {krajnjiDatum.ToShortDateString()} ." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }


    [AllowAnonymous]
    [HttpGet("GetAllDaysOff/{idStomatologa}")]
    public IActionResult GetAllDaysOff(int idStomatologa)
    {
        try
        {
            var stomatolog = stomatologService.Get(idStomatologa);

            if (stomatolog == null)
            {
                return NotFound($"Stomatolog sa ID = {idStomatologa} nije pronađen.");
            }

            var slobodniDani = stomatolog.SlobodniDani
                .Select(d => DateTime.SpecifyKind(d, DateTimeKind.Utc).ToString("yyyy-MM-dd"))
                .ToList();

            return Ok(slobodniDani);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Greška: {ex.Message}");
        }
    }

    [AllowAnonymous]
    [HttpPut("changeShift/{idStomatologa}")]
    public IActionResult ChangeShift(int idStomatologa)
    {


        try
        {
            var stomatolog = stomatologService.Get(idStomatologa);

            if (stomatolog == null)
            {
                return NotFound($"Stomatolog with ID = {idStomatologa} not found.");
            }
            stomatolog.PrvaSmena = !stomatolog.PrvaSmena;

            stomatologService.Update(idStomatologa, stomatolog);
            // var changed = stomatologService.ChangeShift(objectId);

            // if (!changed)
            // {
            //     return BadRequest($"Unable to change shift for stomatolog with ID = {idStomatologa}.");
            // } New shift: {(!stomatolog.PrvaSmena ? "prva" : "druga")}.

            return Ok(new { message = $"Shift change for stomatolog with ID = {idStomatologa}." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }
}