using System.Globalization;
using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Mvc;
using StomatoloskaOrdinacija.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace StomatoloskaOrdinacija.Controllers;

[ApiController]
[Route("[controller]")]
public class IntervencijaController(IIntervencijaService intervencijaService) : ControllerBase
{
    private readonly IIntervencijaService intervencijaService = intervencijaService;

    [HttpGet]
    public ActionResult<List<Intervencija>> Get()
    {
        return intervencijaService.Get();
    }
    [HttpGet("getDTOs")]
    public ActionResult<TipIntervencijeDTO> GetDTOs()
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
    public ActionResult<Intervencija> Get(int id)
    {
        var intervencija = intervencijaService.Get(id);

        if (intervencija == null)
        {
            return NotFound($"Intervencija with Id = {id} not found");
        }

        return intervencija;
    }

    [HttpGet("getIntervencijaDTO/{id}")]
    public ActionResult<TipIntervencijeDTO> GetIntervencijaDTO(int id)
    {

        var intervencija = intervencijaService.Get(id);

        if (intervencija == null)
        {
            return NotFound($"Intervencija with Id = {id} not found");
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
    public ActionResult<Intervencija> Post([FromBody] Intervencija intervencija)
    {
        intervencijaService.Create(intervencija);

        return CreatedAtAction(nameof(Get), new { id = intervencija.Id }, intervencija);
    }



    [HttpPut("{id}/{cena}")]
    public ActionResult Put(int id, int cena)
    {
        var intervencija = intervencijaService.Get(id);

        if (intervencija == null)
        {
            return NotFound($"Intervencija with Id = {id} not found");
        }

        intervencija.Cena = cena;
        intervencijaService.Update(id, intervencija);

        return NoContent();
    }



    [Authorize]
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        var intervencija = intervencijaService.Get(id);

        if (intervencija == null)
        {
            return NotFound($"Intervencija with Id = {id} not found");
        }

        intervencijaService.Remove(id);
        return Ok(new { message = $"Intervencija with Id = {id} deleted" });
    }



}