export interface PacijentDTO {
    id: string;
    slika: string,
    ime: string;
    prezime: string;
    godine: number;
    datumRodjenja: string;
    adresa: string;
    brojTelefona: string;
    email: string;
    role: string;
    ukupnoPotroseno: number;
    brojNedolazaka :number;
    dugovanje: number;
    pregledi: string[];
  }
  
  