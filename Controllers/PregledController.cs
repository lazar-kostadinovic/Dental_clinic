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
public class PregledController : ControllerBase
{
    private readonly IPregledService pregledService;
    private readonly IStomatologService stomatologService;
    private readonly IPacijentService pacijentService;


    public PregledController(IPregledService pregledService, IStomatologService stomatologService, IPacijentService pacijentService)
    {
        this.pregledService = pregledService;
        this.stomatologService = stomatologService;
        this.pacijentService = pacijentService;
    }

    [HttpGet]
    public ActionResult<List<Pregled>> Get()
    {
        return pregledService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<Pregled> Get(ObjectId id)
    {
        var pregled = pregledService.Get(id);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        return pregled;
    }

    [HttpGet("getPregledDTO/{id}")]
    public ActionResult<PregledDTO> GetPregledDTO(string id)
    {
        pregledService.UpdatePregledStatuses();
        if (!ObjectId.TryParse(id, out var objectId))
        {
            return BadRequest("Invalid ObjectId format.");
        }

        var pregled = pregledService.Get(objectId);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        var pregledDTO = new PregledDTO
        {
            Id = pregled.Id.ToString(),
            IdStomatologa = pregled.IdStomatologa.ToString(),
            IdPacijenta = pregled.IdPacijenta.ToString(),
            Datum = pregled.Datum,
            Opis = pregled.Opis,
            Status = pregled.Status
        };
        return pregledDTO;
    }

    [HttpGet("availableTimeSlots/{idStomatologa}/{datum}")]
    public ActionResult<IEnumerable<string>> GetAvailableTimeSlots(ObjectId idStomatologa, DateTime datum)
    {
        try
        {
            var stomatolog = stomatologService.Get(idStomatologa);

            if (stomatolog == null)
            {
                return NotFound($"Stomatolog with Id = {idStomatologa} not found");
            }
            var prvaSmenaTimeSlots = new List<string> { "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00" };
            var drugaSmenaTimeSlots = new List<string> { "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00" };

            var allTimeSlots = stomatolog.PrvaSmena ? prvaSmenaTimeSlots : drugaSmenaTimeSlots;
            var existingAppointments = pregledService.GetStomatologAppointmentsInDateRange(idStomatologa, datum, datum.AddDays(1));
            var availableTimeSlots = allTimeSlots.Except(existingAppointments.Select(appointment => appointment.Datum.ToUniversalTime().ToString("HH:mm")));

            return Ok(availableTimeSlots);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("availableTimeSlots/{datum}")]
    public ActionResult<IEnumerable<string>> GetAvailableTimeSlots(DateTime datum)
    {
        var allTimeSlots = new List<string> { "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00" };
        var existingAppointments = pregledService.GetAppointmentsInDateRange(datum.Date, datum.Date.AddDays(1));
        var existingTimeSlots = existingAppointments.Select(appointment => appointment.Datum.ToUniversalTime().ToString("HH:mm"));
        var availableTimeSlots = allTimeSlots.Except(existingTimeSlots);
        return Ok(availableTimeSlots);
    }

    [HttpPut("assignDentist/{idPregleda}/{idStomatologa}")]
    public IActionResult AssignDentist(ObjectId idPregleda, ObjectId idStomatologa)
    {
        var pregled = pregledService.Get(idPregleda);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {idPregleda} not found");
        }

        if (pregled.IdStomatologa != null)
        {
            return BadRequest("This appointment already has an assigned dentist.");
        }

        stomatologService.GetAndUpdate(idStomatologa, pregled.Id);

        pregled.IdStomatologa = idStomatologa;
        pregledService.Update(idPregleda, pregled);

        return Ok(new { message = "Dentist assigned successfully." });
    }




    [HttpPost]
    public ActionResult<Pregled> Post([FromBody] Pregled pregled)
    {
        pregledService.Create(pregled);

        return CreatedAtAction(nameof(Get), new { id = pregled.Id }, pregled);
    }

    [HttpPost("schedule/{idPacijenta}/{datum}/{opis}")]
    public IActionResult ScheduleAppointment(ObjectId idPacijenta, DateTime datum, string opis)
    {
        var pregled = new Pregled
        {
            IdStomatologa = null,
            IdPacijenta = idPacijenta,
            Datum = datum.ToLocalTime(),
            Opis = opis,
            Status = StatusPregleda.Predstojeci
        };

        if (pregled == null)
        {
            return BadRequest("Invalid appointment data");
        }

        var patient = pacijentService.Get(pregled.IdPacijenta);
        patient.Dugovanje += 1500;
        pacijentService.Update(pregled.IdPacijenta, patient);

        if (patient == null)
        {
            return NotFound("Patient not found");
        }

        // if (IsAppointmentConflict(pregled))
        // {
        //     return BadRequest("Appointment time conflict");
        // }

        pregledService.Create(pregled);
        pacijentService.GetAndUpdate(pregled.IdPacijenta, pregled.Id);
        var response = new
        {
            Id = pregled.Id.ToString(),
            IdStomatologa = pregled.IdStomatologa,
            IdPacijenta = pregled.IdPacijenta,
            Datum = pregled.Datum,
            Opis = pregled.Opis,
            Status = pregled.Status
        };

        return CreatedAtAction(nameof(pregledService.Get), new { id = response.Id }, response);
    }

    [HttpPost("schedule/{idStomatologa}/{idPacijenta}/{datum}/{opis}")]
    public IActionResult ScheduleAppointment(ObjectId idStomatologa, ObjectId idPacijenta, DateTime datum, string opis)
    {
        var pregled = new Pregled
        {
            IdStomatologa = idStomatologa,
            IdPacijenta = idPacijenta,
            Datum = datum.ToLocalTime(),
            Opis = opis,
            Status = StatusPregleda.Predstojeci
        };

        if (pregled == null)
        {
            return BadRequest("Invalid appointment data");
        }


        var stomatolog = stomatologService.Get(pregled.IdStomatologa);
        if (stomatolog == null)
        {
            return NotFound("Stomatolog not found");
        }

        var patient = pacijentService.Get(pregled.IdPacijenta);
        patient.Dugovanje += 1500;
        pacijentService.Update(pregled.IdPacijenta, patient);

        if (patient == null)
        {
            return NotFound("Patient not found");
        }

        // if (IsAppointmentConflict(pregled))
        // {
        //     return BadRequest("Appointment time conflict");
        // }

        pregledService.Create(pregled);
        pacijentService.GetAndUpdate(pregled.IdPacijenta, pregled.Id);
        stomatologService.GetAndUpdate(pregled.IdStomatologa, pregled.Id);
        var response = new
        {
            Id = pregled.Id.ToString(),
            IdStomatologa = pregled.IdStomatologa,
            IdPacijenta = pregled.IdPacijenta,
            Datum = pregled.Datum,
            Opis = pregled.Opis,
            Status = pregled.Status
        };

        return CreatedAtAction(nameof(pregledService.Get), new { id = response.Id }, response);
    }

    [HttpPut("{id}/{datum}/{opis}")]
    public ActionResult Put(ObjectId id, DateTime datum, string opis)
    {
        var existingPregled = pregledService.Get(id);

        if (existingPregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        var pregled = new Pregled
        {
            Id = existingPregled.Id,
            IdStomatologa = existingPregled.IdStomatologa,
            IdPacijenta = existingPregled.IdPacijenta,
            Datum = datum,
            Opis = opis,
            Status = existingPregled.Status
        };

        pregledService.Update(id, pregled);

        return NoContent();
    }

    [HttpPut("{id}/{opis}")]
    public ActionResult Put(ObjectId id, string opis)
    {
        var existingPregled = pregledService.Get(id);

        if (existingPregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        existingPregled.Opis = opis;
        pregledService.Update(id, existingPregled);

        return NoContent();
    }

    [HttpPut("updateStatus/{id}/{status}")]
    public ActionResult UpdateStatus(ObjectId id, int status)
    {
        var existingPregled = pregledService.Get(id);

        if (existingPregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        existingPregled.Status = (StatusPregleda)status;
        pregledService.Update(id, existingPregled);

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public ActionResult Delete(ObjectId id)
    {
        var pregled = pregledService.Get(id);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        var patientId = pregled.IdPacijenta;
        var stomatologId = pregled.IdStomatologa;

        if (!pacijentService.RemoveAppointment(patientId, id))
        {
            return NotFound($"Patient with Id = {patientId} or appointment with Id = {id} not found");
        }
        if (stomatologId != null)
        {
            stomatologService.RemoveAppointment(stomatologId, id);
            pregledService.Remove(id);
            return Ok(new { message = $"Pregled with Id = {id} deleted" });
        }
        else
        {
            pregledService.Remove(id);
            return Ok(new { message = $"Pregled with Id = {id} deleted" });
        }

    }

    private bool IsAppointmentConflict(Pregled pregled)
    {
        var stomatolog = stomatologService.Get(pregled.IdStomatologa);
        if (stomatolog.PredstojeciPregledi.Any(existingAppointmentId =>
            pregledService.Get(existingAppointmentId)?.Datum == pregled.Datum))
        {
            return true;
        }

        var patient = pacijentService.Get(pregled.IdPacijenta);
        if (patient.IstorijaPregleda.Any(existingAppointmentId =>
            pregledService.Get(existingAppointmentId)?.Datum == pregled.Datum))
        {
            return true;
        }

        return false;
    }

    // [HttpPost("scheduleNextAvailable/{idStomatologa}/{idPacijenta}")]
    // public IActionResult ScheduleNextAvailable(ObjectId idStomatologa, ObjectId idPacijenta)
    // {
    //     try
    //     {
    //         var stomatolog = stomatologService.Get(idStomatologa);
    //         if (stomatolog == null)
    //         {
    //             return NotFound($"Stomatolog with Id = {idStomatologa} not found");
    //         }

    //         var patient = pacijentService.Get(idPacijenta);
    //         patient.Dugovanje += 1500;
    //         pacijentService.Update(idPacijenta, patient);

    //         var prvaSmenaTimeSlots = new List<string> { "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00" };
    //         var drugaSmenaTimeSlots = new List<string> { "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00" };
    //         var allTimeSlots = stomatolog.PrvaSmena ? prvaSmenaTimeSlots : drugaSmenaTimeSlots;

    //         var currentDate = DateTime.Now.Date;

    //         while (true)
    //         {
    //             var existingAppointments = pregledService.GetStomatologAppointmentsInDateRange(idStomatologa, currentDate, currentDate.AddDays(1));
    //             var existingTimeSlots = existingAppointments.Select(appointment => appointment.Datum.ToUniversalTime().ToString("HH:mm"));
    //             var availableTimeSlots = allTimeSlots.Except(existingTimeSlots).ToList();

    //             if (availableTimeSlots.Any())
    //             {
    //                 var nextAvailableTime = DateTime.ParseExact(availableTimeSlots.First(), "HH:mm", CultureInfo.InvariantCulture);
    //                 var scheduledDateTime = currentDate.AddHours(nextAvailableTime.Hour).AddMinutes(nextAvailableTime.Minute);

    //                 var pregled = new Pregled
    //                 {
    //                     IdStomatologa = idStomatologa,
    //                     IdPacijenta = idPacijenta,
    //                     Datum = scheduledDateTime,
    //                     Opis = "opis",
    //                     Status = StatusPregleda.Predstojeci
    //                 };

    //                 pregledService.Create(pregled);
    //                 pacijentService.GetAndUpdate(pregled.IdPacijenta, pregled.Id);
    //                 stomatologService.GetAndUpdate(pregled.IdStomatologa, pregled.Id);

    //                 return CreatedAtAction(nameof(Get), new { id = pregled.Id }, new
    //                 {
    //                     Id = pregled.Id.ToString(),
    //                     IdStomatologa = pregled.IdStomatologa,
    //                     IdPacijenta = pregled.IdPacijenta,
    //                     Datum = pregled.Datum,
    //                     Opis = pregled.Opis,
    //                     Status = pregled.Status
    //                 });
    //             }

    //             currentDate = currentDate.AddDays(1);
    //         }
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(500, ex.Message);
    //     }
    // }
    [HttpGet("unconfirmed")]
    public ActionResult<List<PregledDTO>> GetUnconfirmedAppointments()
    {
        var unconfirmedAppointments = pregledService.GetUnconfirmedAppointments();

        if (unconfirmedAppointments == null || !unconfirmedAppointments.Any())
        {
            return NotFound("No unconfirmed appointments found.");
        }

        var unconfirmedAppointmentsDTO = unconfirmedAppointments.Select(appointment => new PregledDTO
        {
            Id = appointment.Id.ToString(),
            IdPacijenta = appointment.IdPacijenta.ToString(),
            Datum = appointment.Datum,
            Opis = appointment.Opis
        }).ToList();

        return Ok(unconfirmedAppointmentsDTO);
    }

}