export interface StomatologDTO {
  id: string;
  slika: string;
  ime: string;
  prezime: string;
  adresa: string;
  email: string;
  brojTelefona: string;
  role: string;
  specijalizacija: number;
  predstojeciPregledi: string[];
  komentariStomatologa: string[];
}