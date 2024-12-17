using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StomatoloskaOrdinacija.Models
{
    [BsonIgnoreExtraElements]

    public class TipIntervencije
    {
        [BsonId]
        public ObjectId Id { get; set; }
        [BsonElement("Naziv")]
        public string Naziv { get; set; }
        [BsonElement("Cena")]
        public int Cena { get; set; }
    }
}
