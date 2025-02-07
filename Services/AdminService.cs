using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using StomatoloskaOrdinacija;
using StomatoloskaOrdinacija.Models;
using StomatoloskaOrdinacija.Services;

namespace Ambulanta.Services
{
    public class AdminService : IAdminService
    {
        private readonly OrdinacijaDbContext _context;
        private readonly string _pepper;
        private readonly int _iteration;

        public AdminService(OrdinacijaDbContext context, IConfiguration config)
        {
            _context = context;
            _pepper = config["PasswordHasher:Pepper"];
            _iteration = config.GetValue<int>("PasswordHasher:Iteration");
        }

        public async Task<Admin> GetAdminByEmailAsync(string email)
        {
            return await _context.Admin.FirstOrDefaultAsync(admin => admin.Email == email);
        }

        public async Task<bool> Register(RegistrationModelAdmin resource)
        {
            var admin = new Admin
            {
                Role = UserRole.Administrator,
                Email = resource.Email,
                PasswordSalt = PasswordHasher.GenerateSalt(),
            };
            admin.Password = PasswordHasher.ComputeHash(resource.Password, admin.PasswordSalt, _pepper, _iteration);
            
            await _context.Admin.AddAsync(admin);
            await _context.SaveChangesAsync();
            
            return true;
        }
    }
}
