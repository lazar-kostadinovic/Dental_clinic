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

    [Route("api/[controller]")]
    [ApiController]
    public class AuthStomatologController(IConfiguration config, IStomatologService stomatolog) : ControllerBase
    {
        private readonly IConfiguration _config = config;
        private readonly IStomatologService _stomatolog = stomatolog;

        [HttpPost]
        public async Task<IActionResult> Authenticate([FromBody] LoginModel login)
        {
            var stomatolog = await _stomatolog.GetStomatologByEmailAsync(login.Email);

            var calculatedPassword = PasswordHasher.ComputeHash(login.Password, stomatolog.PasswordSalt, _config["PasswordHasher:Pepper"], 3);
            if (stomatolog == null || stomatolog.Password != calculatedPassword)
            {
                return Unauthorized();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new(ClaimTypes.Email, stomatolog.Email),
                    new(ClaimTypes.Name, stomatolog.Ime),
                    new(ClaimTypes.Role,stomatolog.Role.ToString())
                    
                }),
                Expires = DateTime.UtcNow.AddMinutes(15),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { Token = tokenString });

        }
    }
}
