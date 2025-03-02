using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ambulanta.Services;


namespace StomatoloskaOrdinacija.Controllers;

[ApiController]
[Route("[controller]")]
public class AdmininstratorController(IAdminService adminService, IStomatologService stomatologService, IPacijentService pacijentService, IConfiguration config) : ControllerBase
{
    private readonly IAdminService adminService = adminService;
    private readonly IStomatologService stomatologService = stomatologService;
    private readonly IPacijentService pacijentService = pacijentService;

    [HttpGet("GetAdminByEmail/{email}")]
    public async Task<IActionResult> GetAdminByEmail(string email)
    {
        var admin = await adminService.GetAdminByEmailAsync(email);

        if (admin == null)
        {
            return NotFound($"Admin with email = {email} not found");
        }

        return Ok(admin);
    }
    [HttpGet("GetUserRole/{email}")]
    public async Task<IActionResult> GetUserRole(string email)
    {
        var admin = await adminService.GetAdminByEmailAsync(email);
        if (admin != null)
        {
            return Ok(new { role = admin.Role });
        }

        var pacijent = await pacijentService.GetPacijentByEmailAsync(email);
        if (pacijent != null)
        {
            return Ok(new { role = pacijent.Role });
        }

        var stomatolog = await stomatologService.GetStomatologByEmailAsync(email);
        if (stomatolog != null)
        {
            return Ok(new { role = stomatolog.Role });
        }

        return NotFound("Korisnik nije pronađen");
    }





    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegistrationModelAdmin resource)
    {
        try
        {
            var response = await adminService.Register(resource);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(new { ErrorMessage = e.Message });
        }
    }
}