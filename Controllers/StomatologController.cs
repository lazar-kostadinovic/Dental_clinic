using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using StomatoloskaOrdinacija.DTOs;

namespace StomatoloskaOrdinacija.Controllers;
[Authorize]
[ApiController]
[Route("[controller]")]
public class StomatologController : ControllerBase
{
    private readonly IStomatologService stomatologService;

    private readonly IPacijentService pacijentService;
    private readonly IPregledService pregledService;

    public StomatologController(IStomatologService stomatologService, IPacijentService pacijentService, IPregledService pregledService, IConfiguration config)
    {
        this.stomatologService = stomatologService;
        this.pacijentService = pacijentService;
        this.pregledService = pregledService;
    }

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
            PredstojeciPregledi = stomatolog.PredstojeciPregledi.Select(p => p.ToString()).ToList(),
            KomentariStomatologa = stomatolog.KomentariStomatologa.Select(k => k.ToString()).ToList()
        }).ToList();

        return Ok(stomatoloziDTO);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public ActionResult<Stomatolog> Get(ObjectId id)
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
        if (!ObjectId.TryParse(id, out var objectId))
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
            PredstojeciPregledi = stomatolog.PredstojeciPregledi.Select(p => p.ToString()).ToList(),
            KomentariStomatologa = stomatolog.KomentariStomatologa.Select(k => k.ToString()).ToList()
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
            Specijalizacija = stomatolog.Specijalizacija,
            KomentariStomatologa = stomatolog.KomentariStomatologa.Select(id => id.ToString()).ToList(),
            PredstojeciPregledi = stomatolog.PredstojeciPregledi.Select(id => id.ToString()).ToList(),
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
    public ActionResult ChangeEmail(ObjectId id, string newEmail)
    {
        var existingStomatolog = stomatologService.Get(id);
        if (existingStomatolog == null)
        {
            return NotFound($"Stomatolog with id = {id} not found");
        }

        existingStomatolog.Email = newEmail;

        stomatologService.Update(existingStomatolog.Id, existingStomatolog);

        return NoContent();
    }

    [HttpPut("changeAddress/{id}/{adresa}")]
    public ActionResult ChangeAddress(ObjectId id, string adresa)
    {
        var existingStomatolog = stomatologService.Get(id);
        if (existingStomatolog == null)
        {
            return NotFound($"Stomatolog with id = {id} not found");
        }

        existingStomatolog.Adresa = adresa;

        stomatologService.Update(existingStomatolog.Id, existingStomatolog);

        return NoContent();
    }

    [HttpPut("changeNumber/{id}/{brojTelefona}")]
    public ActionResult ChangeNumber(ObjectId id, string brojTelefona)
    {
        var existingStomatolog = stomatologService.Get(id);
        if (existingStomatolog == null)
        {
            return NotFound($"Stomatolog with id = {id} not found");
        }

        existingStomatolog.BrojTelefona = brojTelefona;

        stomatologService.Update(existingStomatolog.Id, existingStomatolog);

        return NoContent();
    }

    [AllowAnonymous]
    [HttpPost("uploadSlika/{id}")]
    public IActionResult UploadSlika(string id, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is empty.");
        }

        var dentist = stomatologService.Get(new ObjectId(id));
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
    public ActionResult Delete(ObjectId id)
    {
        var stomatolog = stomatologService.Get(id);

        if (stomatolog == null)
        {
            return NotFound(new { message = $"Stomatolog with Id = {id} not found" });
        }

        var pregledi = pregledService.GetByStomatologId(id);

        foreach (var pregled in pregledi)
        {
            var patientId = pregled.IdPacijenta;

            if (!pacijentService.RemoveAppointment(patientId, pregled.Id))
            {
                return NotFound(new { message = $"Failed to remove appointment with Id = {pregled.Id} from patient with Id = {patientId}" });
            }

            if (!stomatologService.RemoveAppointment(id, pregled.Id))
            {
                return NotFound(new { message = $"Failed to remove appointment with Id = {pregled.Id} from stomatolog with Id = {id}" });
            }

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
            var response = await stomatologService.Register(resource);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(new { ErrorMessage = e.Message });
        }
    }

    [HttpPost("addDayOff/{idStomatologa}/{datum}")]
    public IActionResult AddFreeDay(ObjectId idStomatologa, DateTime datum)
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

    [AllowAnonymous]
    [HttpGet("GetAllDaysOff/{idStomatologa}")]
    public IActionResult GetAllDaysOff(ObjectId idStomatologa)
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
    public IActionResult ChangeShift(string idStomatologa)
    {
        if (!ObjectId.TryParse(idStomatologa, out var objectId))
        {
            return BadRequest("Invalid ObjectId format.");
        }

        try
        {
            var stomatolog = stomatologService.Get(objectId);

            if (stomatolog == null)
            {
                return NotFound($"Stomatolog with ID = {idStomatologa} not found.");
            }
            stomatolog.PrvaSmena = !stomatolog.PrvaSmena;

            stomatologService.Update(objectId, stomatolog);
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