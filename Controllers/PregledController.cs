using System.Globalization;
using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Mvc;
using StomatoloskaOrdinacija.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace StomatoloskaOrdinacija.Controllers;

[ApiController]
[Route("[controller]")]
public class PregledController(IPregledService pregledService, IStomatologService stomatologService, IPacijentService pacijentService, IPregledIntervencijaService pregledIntervencijaService) : ControllerBase
{
    private readonly IPregledService pregledService = pregledService;
    private readonly IStomatologService stomatologService = stomatologService;
    private readonly IPacijentService pacijentService = pacijentService;
    private readonly IPregledIntervencijaService pregledIntervencijaService = pregledIntervencijaService;

    [HttpGet]
    public ActionResult<List<Pregled>> Get()
    {
        return pregledService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<Pregled> Get(int id)
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
        if (!int.TryParse(id, out var objectId))
        {
            return BadRequest("Invalid int format.");
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
            PacijentEmail = pregled.EmailPacijenta,
            Naplacen = pregled.Naplacen,
            Datum = pregled.Datum,
            Opis = pregled.Opis,
            Status = pregled.Status,
            Intervencije = pregledService.GetIntervencijeZaPregled(pregled.Id),
            UkupnaCena = pregled.UkupnaCena

        };
        return pregledDTO;
    }

    // [HttpGet("availableTimeSlots/{idStomatologa}/{datum}")]
    // public ActionResult<IEnumerable<string>> GetAvailableTimeSlots(int idStomatologa, DateTime datum)
    // {
    //     try
    //     {
    //         var stomatolog = stomatologService.Get(idStomatologa);

    //         if (stomatolog == null)
    //         {
    //             return NotFound($"Stomatolog with Id = {idStomatologa} not found");
    //         }
    //         var prvaSmenaTimeSlots = new List<string> { "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00" };
    //         var drugaSmenaTimeSlots = new List<string> { "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00" };

    //         var allTimeSlots = stomatolog.PrvaSmena ? prvaSmenaTimeSlots : drugaSmenaTimeSlots;
    //         var appointments = pregledService.GetStomatologAppointmentsInDateRange(idStomatologa, datum, datum.AddDays(1));
    //         var availableTimeSlots = allTimeSlots.Except(appointments.Select(appointment => appointment.Datum.ToUniversalTime().ToString("HH:mm")));

    //         return Ok(availableTimeSlots);
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(500, ex.Message);
    //     }
    // }

    [HttpGet("availableTimeSlots/{idStomatologa}/{datum}")]
    public ActionResult<IEnumerable<string>> GetAvailableTimeSlots(int idStomatologa, DateTime datum)
    {
        try
        {
            var stomatolog = stomatologService.Get(idStomatologa);

            if (stomatolog == null)
            {
                return NotFound($"Stomatolog with Id = {idStomatologa} not found");
            }
            var allTimeSlots = new List<string> { "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00" };

            var appointments = pregledService.GetStomatologAppointmentsInDateRange(idStomatologa, datum, datum.AddDays(1));
            var availableTimeSlots = allTimeSlots.Except(appointments.Select(appointment => appointment.Datum.ToUniversalTime().ToString("HH:mm")));

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

        var appointments = pregledService.GetAppointmentsInDateRange(datum.Date, datum.Date.AddDays(1));


        var appointmentCounts = appointments
            .GroupBy(appointment => appointment.Datum.ToUniversalTime().ToString("HH:mm"))
            .ToDictionary(group => group.Key, group => group.Count());

        var availableTimeSlots = allTimeSlots.Where(slot =>
            !appointmentCounts.ContainsKey(slot) || appointmentCounts[slot] < 2);

        return Ok(availableTimeSlots);
    }


    [HttpPut("assignDentist/{idPregleda}/{idStomatologa}")]
    public ActionResult AssignDentist(int idPregleda, int idStomatologa)
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

        var stomatologAppointments = pregledService.GetStomatologAppointmentsInDateRange(idStomatologa, pregled.Datum.Date, pregled.Datum.Date.AddDays(1));
        if (stomatologAppointments.Any(a => a.Datum == pregled.Datum))
        {
            return BadRequest("Imate zakazan pregled u ovom terminu.");
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
    public async Task<ActionResult> ScheduleAppointment(int idPacijenta, DateTime datum, string opis)
    {
        var emailPacijenta = await pacijentService.GetEmailByIdAsync(idPacijenta);
        var pregled = new Pregled
        {
            IdStomatologa = null,
            IdPacijenta = idPacijenta,
            EmailPacijenta = emailPacijenta,
            Datum = datum.ToLocalTime(),
            Opis = opis,
            Status = StatusPregleda.Predstojeci
        };

        if (pregled == null)
        {
            return BadRequest("Invalid appointment data");
        }

        var patient = pacijentService.Get(pregled.IdPacijenta);
        pacijentService.Update(pregled.IdPacijenta, patient);

        if (patient == null)
        {
            return NotFound("Patient not found");
        }

        pregledService.Create(pregled);
        pacijentService.GetAndUpdate(pregled.IdPacijenta, pregled.Id);
        var response = new
        {
            Id = pregled.Id.ToString(),
            IdStomatologa = pregled.IdStomatologa,
            IdPacijenta = pregled.IdPacijenta,
            EmailPacijenta = emailPacijenta,
            Datum = pregled.Datum,
            PacijentEmail = pregled.EmailPacijenta,
            Naplacen = false,
            Opis = pregled.Opis,
            Status = pregled.Status
        };

        return CreatedAtAction(nameof(pregledService.Get), new { id = response.Id }, response);
    }

    [HttpPost("schedule/{idStomatologa}/{idPacijenta}/{datum}/{opis}")]
    public async Task<ActionResult> ScheduleAppointment(int idStomatologa, int idPacijenta, DateTime datum, string opis)
    {
        var emailPacijenta = await pacijentService.GetEmailByIdAsync(idPacijenta);

        if (string.IsNullOrEmpty(emailPacijenta))
        {
            return NotFound("Patient email not found");
        }

        var pregled = new Pregled
        {
            IdStomatologa = idStomatologa,
            IdPacijenta = idPacijenta,
            EmailPacijenta = emailPacijenta,
            Datum = datum.ToLocalTime(),
            Naplacen = false,
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
        if (patient == null)
        {
            return NotFound("Patient not found");
        }

        pregledService.Create(pregled);
        pacijentService.GetAndUpdate(pregled.IdPacijenta, pregled.Id);
        stomatologService.GetAndUpdate(pregled.IdStomatologa, pregled.Id);
        var response = new
        {
            Id = pregled.Id.ToString(),
            IdStomatologa = pregled.IdStomatologa,
            IdPacijenta = pregled.IdPacijenta,
            EmailPacijenta = pregled.EmailPacijenta,
            Datum = pregled.Datum,
            Naplacen = false,
            Opis = pregled.Opis,
            Status = pregled.Status
        };

        return CreatedAtAction(nameof(pregledService.Get), new { id = response.Id }, response);
    }


    [HttpPut("{id}/{datum}/{opis}")]
    public ActionResult Put(int id, DateTime datum, string opis)
    {
        var pregled = pregledService.Get(id);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }
        pregled.Datum = datum;
        pregled.Opis = opis;

        pregledService.Update(id, pregled);

        return NoContent();
    }

    [HttpPut("{id}/{opis}")]
    public ActionResult Put(int id, string opis)
    {
        var pregled = pregledService.Get(id);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        pregled.Opis = opis;
        pregledService.Update(id, pregled);

        return NoContent();
    }

    [HttpPut("updateStatus/{id}/{status}")]
    public ActionResult UpdateStatus(int id, int status)
    {
        var pregled = pregledService.Get(id);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        pregled.Status = (StatusPregleda)status;
        pregledService.Update(id, pregled);

        return NoContent();
    }

    [HttpPut("chargeAppointment/{id}/{patientId}")]
    public ActionResult ChargeAppointment(int id, int patientId, [FromBody] ChargeAppointmentRequest request)
    {
        var pregled = pregledService.Get(id);
        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        var patient = pacijentService.Get(patientId);
        if (patient == null)
        {
            return NotFound($"Patient with Id = {patientId} not found");
        }

        pregled.Naplacen = true;
        pregled.UkupnaCena = request.UkupnaCena;

        patient.Dugovanje += request.UkupnaCena;
        pacijentService.Update(patientId, patient);

        var pregledIntervencije = request.Intervencije.Select(i => new PregledIntervencija
        {
            PregledId = id,
            IntervencijaId = i.IntervencijaId,
            Kolicina = i.Kolicina
        }).ToList();

        foreach (var pregledIntervencija in pregledIntervencije)
        {
            pregledIntervencijaService.Create(pregledIntervencija);
        }

        if (pregled.IdStomatologa != null)
        {
            var stomatolog = stomatologService.Get(pregled.IdStomatologa);
            if (stomatolog != null)
            {
                stomatolog.BrojPregleda += 1;
                stomatologService.Update((int)pregled.IdStomatologa, stomatolog);
            }
        }

        pregledService.Update(id, pregled);

        return NoContent();
    }


    [Authorize]
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {

        var pregled = pregledService.Get(id);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        pregledService.Remove(id);

        return Ok(new { message = $"Pregled with Id = {id} deleted" });
    }


    [HttpPost("scheduleNextAvailable/{idPacijenta}")]
    public async Task<ActionResult> ScheduleNextAvailable(int idPacijenta)
    {
        try
        {
            var emailPacijenta = await pacijentService.GetEmailByIdAsync(idPacijenta);
            if (string.IsNullOrEmpty(emailPacijenta))
            {
                return NotFound("Patient email not found.");
            }

            var allTimeSlots = new List<string>
        {
            "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00",
            "17:00", "18:00", "19:00", "20:00", "21:00"
        };

            var currentDate = DateTime.Now.Date.AddDays(1);

            while (true)
            {
                var allAppointments = pregledService.GetAppointmentsInDateRange(currentDate, currentDate.AddDays(1));
                var occupiedTimeSlots = allAppointments
                    .Select(appointment => appointment.Datum.ToUniversalTime().ToString("HH:mm"))
                    .ToList();

                var availableTimeSlots = allTimeSlots.Except(occupiedTimeSlots).ToList();

                if (availableTimeSlots.Any())
                {

                    var nextAvailableTime = DateTime.ParseExact(availableTimeSlots.First(), "HH:mm", CultureInfo.InvariantCulture);
                    var scheduledDateTime = currentDate.AddHours(nextAvailableTime.Hour).AddMinutes(nextAvailableTime.Minute);

                    var pregled = new Pregled
                    {
                        IdStomatologa = null,
                        IdPacijenta = idPacijenta,
                        EmailPacijenta = emailPacijenta,
                        Datum = scheduledDateTime,
                        Opis = "Pregled zakazan automatski",
                        Status = StatusPregleda.Predstojeci
                    };

                    pregledService.Create(pregled);
                    pacijentService.GetAndUpdate(idPacijenta, pregled.Id);

                    var response = new
                    {
                        Id = pregled.Id.ToString(),
                        IdStomatologa = pregled.IdStomatologa,
                        IdPacijenta = pregled.IdPacijenta,
                        Datum = pregled.Datum,
                        Opis = pregled.Opis,
                        Status = pregled.Status
                    };

                    return CreatedAtAction(nameof(Get), new { id = pregled.Id }, response);
                }

                currentDate = currentDate.AddDays(1);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }


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
            Opis = appointment.Opis,
            PacijentEmail = appointment.EmailPacijenta
        }).ToList();

        return Ok(unconfirmedAppointmentsDTO);
    }

    // [HttpGet("intervencijeZaPregled/{pregledId}")]
    // public ActionResult<List<Intervencija>> GetIntervencijeZaPregled(int pregledId)
    // {
    //     try
    //     {
    //         var intervencije = pregledService.GetIntervencijeZaPregled(pregledId);

    //         if (intervencije == null || !intervencije.Any())
    //         {
    //             return NotFound($"Nema pronađenih intervencija za pregled sa Id = {pregledId}.");
    //         }

    //         return Ok(intervencije);
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(500, ex.Message);
    //     }
    // }

}