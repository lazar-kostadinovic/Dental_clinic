using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Ambulanta.Services;


namespace StomatoloskaOrdinacija.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthAdminController(IConfiguration config, IAdminService admin) : ControllerBase
    {
        private readonly IConfiguration _config = config;
        private readonly IAdminService _admin = admin;

        [HttpPost]
        public async Task<IActionResult> Authenticate([FromBody] LoginModel login)
        {
            var user = await _admin.GetAdminByEmailAsync(login.Email);

            var calculatedPassword = PasswordHasher.ComputeHash(login.Password, user.PasswordSalt, _config["PasswordHasher:Pepper"], 3);
            if (user == null || user.Password != calculatedPassword)
            {
                return Unauthorized();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
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
