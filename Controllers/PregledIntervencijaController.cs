using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Mvc;
using StomatoloskaOrdinacija.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace StomatoloskaOrdinacija.Controllers;

[ApiController]
[Route("[controller]")]
public class PregledIntervencijaController : ControllerBase
{
    private readonly IPregledIntervencijaService pregledIntervencijaService;

    public PregledIntervencijaController(IPregledIntervencijaService pregledIntervencijaService)
    {
        this.pregledIntervencijaService = pregledIntervencijaService;
    }

    [HttpGet]
    public ActionResult<List<PregledIntervencija>> Get()
    {
        var pregledIntervencije = pregledIntervencijaService.Get();
        return Ok(pregledIntervencije);
    }

    [HttpGet("{id}")]
    public ActionResult<PregledIntervencija> Get(int id)
    {
        var pregledIntervencija = pregledIntervencijaService.Get(id);

        if (pregledIntervencija == null)
        {
            return NotFound($"PregledIntervencija with Id = {id} not found");
        }

        return Ok(pregledIntervencija);
    }

    [HttpPost]
    public ActionResult<PregledIntervencija> Post([FromBody] PregledIntervencija pregledIntervencija)
    {
        if (pregledIntervencija == null)
        {
            return BadRequest("PregledIntervencija data is invalid.");
        }

        var createdPregledIntervencija = pregledIntervencijaService.Create(pregledIntervencija);

        return CreatedAtAction(nameof(Get), new { id = createdPregledIntervencija.Id }, createdPregledIntervencija);
    }

    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] PregledIntervencija pregledIntervencija)
    {
        var existingPregledIntervencija = pregledIntervencijaService.Get(id);

        if (existingPregledIntervencija == null)
        {
            return NotFound($"PregledIntervencija with Id = {id} not found");
        }

        pregledIntervencija.Id = id;
        pregledIntervencijaService.Update(id, pregledIntervencija);

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        var pregledIntervencija = pregledIntervencijaService.Get(id);

        if (pregledIntervencija == null)
        {
            return NotFound($"PregledIntervencija with Id = {id} not found");
        }

        pregledIntervencijaService.Remove(id);
        return Ok(new { message = $"PregledIntervencija with Id = {id} deleted" });
    }
}
