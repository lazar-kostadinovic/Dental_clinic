using System.Globalization;
using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using StomatoloskaOrdinacija.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace StomatoloskaOrdinacija.Controllers;

[ApiController]
[Route("[controller]")]
public class IntervencijaController(ITipIntervencijeService intervencijaService) : ControllerBase
{
    private readonly ITipIntervencijeService intervencijaService = intervencijaService;

    [HttpGet]
    public ActionResult<List<TipIntervencije>> Get()
    {
        return intervencijaService.Get();
    }
    [HttpGet("getDTOs")]
    public ActionResult<TipIntervencijeDTO> GetStomatologDTOs()
    {
        var intervencije = intervencijaService.Get();

        if (intervencije == null)
        {
            return NotFound("Nema intervencije u sistemu.");
        }

        var intervencijeDTO = intervencije.Select(intervecnija => new TipIntervencijeDTO
        {
            Id = intervecnija.Id.ToString(),
            Naziv = intervecnija.Naziv,
            Cena = intervecnija.Cena,
        }).ToList();

        return Ok(intervencijeDTO);
    }

    [HttpGet("{id}")]
    public ActionResult<TipIntervencije> Get(ObjectId id)
    {
        var intervencija = intervencijaService.Get(id);

        if (intervencija == null)
        {
            return NotFound($"TipIntervencije with Id = {id} not found");
        }

        return intervencija;
    }

    [HttpGet("getIntervencijaDTO/{id}")]
    public ActionResult<TipIntervencijeDTO> GetIntervencijaDTO(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
        {
            return BadRequest("Invalid ObjectId format.");
        }

        var intervencija = intervencijaService.Get(objectId);

        if (intervencija == null)
        {
            return NotFound($"TipIntervencije with Id = {id} not found");
        }

        var intervencijaDTO = new TipIntervencijeDTO
        {
            Id = intervencija.Id.ToString(),
            Naziv = intervencija.Naziv,
            Cena = intervencija.Cena
        };
        return intervencijaDTO;
    }

    [HttpPost]
    public ActionResult<TipIntervencije> Post([FromBody] TipIntervencije intervencija)
    {
        intervencijaService.Create(intervencija);

        return CreatedAtAction(nameof(Get), new { id = intervencija.Id }, intervencija);
    }



    [HttpPut("{id}/{cena}")]
    public ActionResult Put(ObjectId id, int cena)
    {
        var intervencija = intervencijaService.Get(id);

        if (intervencija == null)
        {
            return NotFound($"TipIntervencije with Id = {id} not found");
        }

        intervencija.Cena = cena;
        intervencijaService.Update(id, intervencija);

        return NoContent();
    }



    [Authorize]
    [HttpDelete("{id}")]
    public ActionResult Delete(ObjectId id)
    {
        var intervencija = intervencijaService.Get(id);

        if (intervencija == null)
        {
            return NotFound($"TipIntervencije with Id = {id} not found");
        }

        intervencijaService.Remove(id);
        return Ok(new { message = $"TipIntervencije with Id = {id} deleted" });
    }



}