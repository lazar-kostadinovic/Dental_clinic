using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace StomatoloskaOrdinacija.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmailControler : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly EmailService _emailService;

        public EmailControler(IConfiguration config, EmailService email)
        {
            _config = config;
            _emailService = email;
        }

        [Authorize]
        [HttpPost("sendCancellationEmail")]
        public async Task<IActionResult> SendCancellationEmail([FromBody] CancellationEmailRequest request)
        {
            try
            {
                await _emailService.SendEmailAsync(
                    request.ToEmail,
                    "Pregled otkazan",
                    $"Poštovani {request.PatientName},<br><br>Vaš pregled zakazan za {request.AppointmentDate} je otkazan.<br><br>S poštovanjem,<br>Vaša ordinacija"
                );
                return Ok(new { message = "Email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error sending email: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPost("sendWarningEmail")]
        public async Task<ActionResult> SendWarningEmail([FromBody] WarningEmailRequest request)
        {
            try
            {
                string subject = "Obaveštenje o dugovanju";
                string body = $@"
            Poštovani {request.PatientName},<br><br>
            Obaveštavamo Vas da imate dugovanje prema našoj ordinaciji u iznosu od {request.Debt} RSD.<br><br>
            Molimo Vas da izvršite uplatu što je pre moguće kako bismo izbegli dodatne troškove.<br><br>
            Za sva pitanja ili dodatne informacije, slobodno nas kontaktirajte.<br><br>
            S poštovanjem,<br>
            Vaša ordinacija
        ";

                await _emailService.SendEmailAsync(request.ToEmail, subject, body);

                return Ok(new { message = "Email upozorenja je uspešno poslat." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error sending email: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPost("sendAppointmentTakenEmail")]
        public async Task<IActionResult> SendAppointmentTakenEmail([FromBody] AppointmentTakenEmailRequest request)
        {
            try
            {
                await _emailService.SendEmailAsync(
                    request.ToEmail,
                    "Pregled preuzet",
                    $"Poštovani {request.PatientName},<br><br>Vaš pregled zakazan za {request.AppointmentDate} je preuzet od strane stomatologa {request.DentistName}.<br><br>S poštovanjem,<br>Vaša ordinacija"
                );
                return Ok(new { message = "Email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error sending email: {ex.Message}");
            }
        }
    }

    public class CancellationEmailRequest
    {
        public string ToEmail { get; set; }
        public string PatientName { get; set; }
        public string AppointmentDate { get; set; }
    }
    public class WarningEmailRequest
    {
        public string ToEmail { get; set; }
        public string PatientName { get; set; }
        public decimal Debt { get; set; }
    }
    public class AppointmentTakenEmailRequest
    {
        public string ToEmail { get; set; }
        public string PatientName { get; set; }
        public string AppointmentDate { get; set; }
        public string DentistName { get; set; }
    }
}
