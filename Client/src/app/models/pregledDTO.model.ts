export interface PregledDTO {
  id: string;
  idStomatologa: string;
  idPacijenta: string;
  pacijentEmail:string;
  datum: Date;
  naplacen: boolean;
  opis: string;
  status: number;
  imeStomatologa?: string;
  imePacijenta?:string
  emailPacijenta?:string
}
