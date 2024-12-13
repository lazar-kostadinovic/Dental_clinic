export interface PacijentDTO {
    id: string;
    slika: string,
    ime: string;
    prezime: string;
    godine: number;
    adresa: string;
    brojTelefona: string;
    email: string;
    role: string;
    ukupnoPotroseno: number;
    dugovanje: number;
    istorijaPregleda: string[];
  }
  
  