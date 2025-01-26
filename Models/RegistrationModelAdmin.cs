using System.ComponentModel.DataAnnotations;

namespace StomatoloskaOrdinacija.Models
{

    public class RegistrationModelAdmin
    {
        [Required, EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
