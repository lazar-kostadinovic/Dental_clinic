using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija.Services
{
    public interface IAdminService
    {
        Task<Admin> GetAdminByEmailAsync(string email);
        Task<bool> Register(RegistrationModelAdmin resource);

    }
}