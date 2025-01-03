using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StomatoloskaOrdinacija.Models
{
    [BsonIgnoreExtraElements]

    public class Pregled
    {
        [BsonId]
        public ObjectId Id { get; set; }
        [BsonElement("IdStomatologa")]
        public ObjectId? IdStomatologa { get; set; }
        [BsonElement("IdPacijenta")]
        public ObjectId IdPacijenta { get; set; }
        [BsonElement("emailPacijenta")]
        public string EmailPacijenta { get; set; }
        [BsonElement("Datum")]
        public DateTime Datum { get; set; }
        [BsonElement("Opis")]
        public string Opis { get; set; }
        [BsonElement("Naplacen")]
        public bool Naplacen { get; set; } = false;
        [BsonElement("Status")]
        public StatusPregleda Status { get; set; }
    }
}

public enum StatusPregleda
{
    Predstojeci,
    Prosli,
    Otkazani
}