using MongoDB.Driver;
using StomatoloskaOrdinacija.Models;
using MongoDB.Bson;

namespace StomatoloskaOrdinacija.Services
{
    public class TipIntervencijeService : ITipIntervencijeService
    {
        private readonly IMongoCollection<TipIntervencije> _intervencije;

        public TipIntervencijeService(IOrdinacijaDatabaseSettings settings, IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase(settings.DatabaseName);
            _intervencije = database.GetCollection<TipIntervencije>(settings.IntervencijaCollectionName);
        }


        public TipIntervencije Create(TipIntervencije intervencija)
        {
            _intervencije.InsertOne(intervencija);
            return intervencija;
        }

        public List<TipIntervencije> Get()
        {
            return _intervencije.Find(intervencija => true).ToList();
        }

        public TipIntervencije Get(ObjectId id)
        {
            return _intervencije.Find(intervencija => intervencija.Id == id).FirstOrDefault();
        }

        public void Remove(ObjectId id)
        {
            _intervencije.DeleteOne(intervencija => intervencija.Id == id);
        }

        public void Update(ObjectId id, TipIntervencije intervencija)
        {
            _intervencije.ReplaceOne(intervencija => intervencija.Id == id, intervencija);
        }


    }
}