using StomatoloskaOrdinacija.Models;
using MongoDB.Bson;

namespace Ambulanta.Services
{
    public interface IAdminService
    {
        Task<Admin> GetAdminByEmailAsync(string email);
        Task<bool> Register(RegistrationModelAdmin resource);

    }
}