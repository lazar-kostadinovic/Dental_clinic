using MongoDB.Driver;
using StomatoloskaOrdinacija.Models;
using MongoDB.Bson;
using StomatoloskaOrdinacija.Services;

namespace Ambulanta.Services
{
    public class AdminService : IAdminService
    {
        private readonly IMongoCollection<Admin> _admin;
        
        private readonly string _pepper;
        private readonly int _iteration;

        public AdminService(IOrdinacijaDatabaseSettings settings, IMongoClient mongoClient, IConfiguration config)
        {
            var database = mongoClient.GetDatabase(settings.DatabaseName);
            _admin = database.GetCollection<Admin>(settings.AdminCollectionName);
            _pepper = config["PasswordHasher:Pepper"];
            _iteration = config.GetValue<int>("PasswordHasher:Iteration");
          
        }

        public async Task<Admin> GetAdminByEmailAsync(string email)
        {
            return await _admin.Find(admin => admin.Email == email).FirstOrDefaultAsync();
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
            _admin.InsertOne(admin);

            return true;
        }

    }
}