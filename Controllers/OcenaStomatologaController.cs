using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Components.Web;
using StomatoloskaOrdinacija.DTOs;

namespace StomatoloskaOrdinacija.Controllers;
// [Authorize]
[ApiController]
[Route("[controller]")]
public class OcenaStomatologaController(IOcenaStomatologaService ocenaStomatologaService, IStomatologService stomatologService, IPacijentService pacijentService) : ControllerBase
{
    private readonly IOcenaStomatologaService ocenaStomatologaService = ocenaStomatologaService;
    private readonly IStomatologService stomatologService = stomatologService;
    private readonly IPacijentService pacijentService = pacijentService;

    [HttpGet]
    public ActionResult<List<OcenaStomatologa>> Get()
    {
        return ocenaStomatologaService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<OcenaStomatologa> Get(int id)
    {
        var ocena = ocenaStomatologaService.Get(id);
        if (ocena == null)
            return NotFound($"Ocena with Id = {id} not found");
        return ocena;
    }
    [HttpGet("getDTO/{id}")]
    public ActionResult<OcenaStomatologaDTO> GetDTO(int id)
    {
        var ocena = ocenaStomatologaService.Get(id);

        if (ocena == null)
        {
            return NotFound($"Ocena with Id = {id} not found");
        }

        var ocenaDTO = new OcenaStomatologaDTO
        {
            Id = ocena.Id.ToString(),
            IdStomatologa = ocena.IdStomatologa.ToString(),
            IdPacijenta = ocena.IdPacijenta.ToString(),
            Datum = ocena.Datum,
            Komentar = ocena.Komentar,
            Ocena = ocena.Ocena
        };
        return ocenaDTO;
    }

    [HttpGet("getAverage/{idStomatologa}")]
    public ActionResult<double> GetAverage(int idStomatologa)
    {
        var ocene = ocenaStomatologaService.Get();
        var ukupno = 0;
        var count = 0;

        foreach (var ocena in ocene)
        {
            if (ocena.IdStomatologa == idStomatologa)
            {
                ukupno += ocena.Ocena;
                count++;
            }
        }

        if (count == 0)
        {
            return NotFound($"No reviews found for dentist with Id = {idStomatologa}");
        }

        var prosek = Math.Round((double)ukupno / count, 2);

        return Ok(prosek);
    }


    [HttpPost]
    public ActionResult<OcenaStomatologa> Post([FromBody] OcenaStomatologa ocena)
    {
        ocenaStomatologaService.Create(ocena);

        return CreatedAtAction(nameof(Get), new { id = ocena.Id }, ocena);
    }

    [HttpPost("{idStomatologa}/{idPacijenta}/{komentar}/{ocena}")]
    public IActionResult AddReview(int idStomatologa, int idPacijenta, string komentar, int ocena)
    {
        var ocenaStomatologa = new OcenaStomatologa
        {
            IdStomatologa = idStomatologa,
            IdPacijenta = idPacijenta,
            Komentar = komentar,
            Ocena = ocena,
            Datum = DateTime.Now

        };

        if (ocenaStomatologa == null)
        {
            return BadRequest("Netacni podaci");
        }

        var stomatolog = stomatologService.Get(ocenaStomatologa.IdStomatologa);
        if (stomatolog == null)
        {
            return NotFound("Stomatolog not found");
        }

        var patient = pacijentService.Get(ocenaStomatologa.IdPacijenta);
        if (patient == null)
        {
            return NotFound("Patient not found");
        }

        ocenaStomatologaService.Create(ocenaStomatologa);

        return CreatedAtAction(nameof(ocenaStomatologaService.Get), new { id = ocenaStomatologa.Id }, ocenaStomatologa);
    }

    [HttpPut("{id}/{komentar}/{ocena}")]
    public ActionResult Put(int id, string komentar, int ocena)
    {
        var review = ocenaStomatologaService.Get(id);

        if (review == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        review.Komentar = komentar;
        review.Ocena = ocena;

        ocenaStomatologaService.Update(id, review);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        var ocena = ocenaStomatologaService.Get(id);

        if (ocena == null)
        {
            return NotFound($"Ocena with Id = {id} not found");
        }

        ocenaStomatologaService.Remove(id);
        return Ok($"Ocena with Id = {id} deleted");
    }

}