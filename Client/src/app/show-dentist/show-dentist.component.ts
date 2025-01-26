import { Component } from '@angular/core';
import { StomatologDTO } from '../models/stomatologDTO.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { KomentarDTO } from '../models/komentarDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-dentist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './show-dentist.component.html',
  styleUrl: './show-dentist.component.css',
})
export class ShowDentistComponent {
  stomatolozi: StomatologDTO[] = [];
  pacijenti: any[] = [];
  email = localStorage.getItem('email');
  patientId?: string;
  selectedStomatologForComments: string | null = null;
  today: string = '';
  imePacijenata: { [key: string]: string } = {};
  selectedSpecijalizacija: string = '';
  prosecnaOcena: any;

  newAppointment = {
    datum: '',
    vreme: '',
    opis: '',
  };

  komentariStomatologa: any[] = [];
  komentarLimit: number = 3;
  newComment = {
    komentar: '',
    ocena: 0,
  };
  selectedStomatolog?: StomatologDTO;
  specijalizacije = [
    'Opsta stomatologija',
    'Oralna hirugija',
    'Ortodontija',
    'Parodontologija',
    'Endodoncija',
    'Pedijatrijska stomatologija',
    'Protetika',
    'Estetska stomatologija',
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if(this.email){
      this.getPatientId();
    }
    this.loadStomatolozi();
    const now = new Date();
    now.setDate(now.getDate() + 1);
    this.today = now.toISOString().split('T')[0];
  }

  showReviews(idsKomentara: string[], idStomatologa: string): void {
    if (this.selectedStomatologForComments === idStomatologa) {
      this.selectedStomatologForComments = null;
      this.komentariStomatologa = [];
      this.selectedStomatolog = undefined;
    } else {
      this.selectedStomatologForComments = idStomatologa;
      this.selectedStomatolog = this.stomatolozi.find(s => s.id === idStomatologa) || undefined;
      this.komentariStomatologa = [];
  
      const komentarRequests = idsKomentara.map((id) =>
        this.http.get<KomentarDTO>(
          `http://localhost:5001/OcenaStomatologa/getDTO/${id}`
        )
      );
  
      if (komentarRequests.length > 0) {
        forkJoin(komentarRequests).subscribe({
          next: (komentari) => {
            this.komentariStomatologa = komentari;
  
            komentari.forEach((komentar) => {
              if (!this.imePacijenata[komentar.idPacijenta]) {
                this.getPacijentName(komentar.idPacijenta);
              }
            });
            this.getAverageRating(idStomatologa);
          },
          error: (error) => {
            console.error('Greška pri učitavanju komentara:', error);
          },
        });
      }
    }
  }
  

  getPatientId(){
    this.http.get("http://localhost:5001/Pacijent/GetPacijentByEmail/" + this.email).subscribe({
      next: (response: any) => {
        this.patientId = response.id;
        return response.id
      },
      error: (error) => {
        console.error("Error:", error);
      }
    });
  }

  loadMoreComments(): void {
    this.komentarLimit += 100;
  }
  addComment(stomatologId: string): void {
    if (!this.newComment.komentar || !this.newComment.ocena) {
      Swal.fire('', 'Molimo popunite sve podatke.', 'warning');
      return;
    }
  
    const commentPayload = {
      komentar: this.newComment.komentar,
      ocena: this.newComment.ocena,
      datum: new Date().toISOString(),
      idPacijenta: this.patientId,
      idStomatologa: stomatologId,
    };
  
    const apiUrl = `http://localhost:5001/OcenaStomatologa/${stomatologId}/${
      this.patientId
    }/${encodeURIComponent(this.newComment.komentar)}/${this.newComment.ocena}`;
  
    this.http.post(apiUrl, {}).subscribe({
      next: (response:any) => {
        console.log('Komentar dodat:', response);
         Swal.fire('', 'Komentar uspešno dodat!', 'success');
        this.komentariStomatologa.push(commentPayload);
        this.loadMoreComments();
        this.getAverageRating(stomatologId);
        this.newComment = { komentar: '', ocena: 0 };
      },
      error: (error) => {
        console.error('Greška pri dodavanju komentara:', error);
        Swal.fire('','Došlo je do greške prilikom dodavanja komentara.', 'warning');
      },
    });
  }
  

  getPacijentName(idPacijenta: string): void {
    if (this.imePacijenata[idPacijenta]) {
      return;
    }

    this.http
      .get<{ ime: string; prezime: string }>(
        `http://localhost:5001/Pacijent/getDTO/${idPacijenta}`
      )
      .subscribe({
        next: (patientData) => {
          this.imePacijenata[
            idPacijenta
          ] = `${patientData.ime} ${patientData.prezime}`;
        },
        error: (error) => {
          console.error('Error fetching patient profile:', error);
          this.imePacijenata[idPacijenta] = 'Nepoznato';
        },
      });
  }

  loadStomatolozi(): void {
    const apiUrl = 'http://localhost:5001/Stomatolog/getDTOs';
    this.http.get<StomatologDTO[]>(apiUrl).subscribe(
      (data) => {
        this.stomatolozi = data.filter(
          (stomatolog) => stomatolog.email !== 'admin@gmail.com'
        );
      },
      (error) => {
        console.error('Greška prilikom učitavanja stomatologa:', error);
      }
    );
  }

  filterBySpecijalizacija(): void {
    if (this.selectedSpecijalizacija === '') {
      this.loadStomatolozi();
    } else {
      const apiUrl = `http://localhost:5001/Stomatolog/BySpecijalizacija/${this.selectedSpecijalizacija}`;
      this.http.get<StomatologDTO[]>(apiUrl).subscribe(
        (data) => {
          this.stomatolozi = data.filter((s) => s.email !== 'admin@gmail.com');
        },
        (error) => {
          console.error('Greška pri filtriranju stomatologa:', error);
          this.stomatolozi = [];
        }
      );
    }
  }

  getSpecijalizacijaLabel(specijalizacija: number,ime:string): string {
    return this.specijalizacije[specijalizacija] || 'Nepoznato';
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:5001/assets/${imageName}`;
  }

  getAverageRating(idStomatologa: string) {
    this.http
      .get(`http://localhost:5001/OcenaStomatologa/getAverage/${idStomatologa}`)
      .subscribe({
        next: (response) => {
          this.prosecnaOcena = response;

          console.log(this.prosecnaOcena);
        },
        error: (error) => {
          console.error('Error fetching average rating', error);
        },
      });
  }

  
  closeReviews() {
    this.selectedStomatologForComments = null;
    this.komentariStomatologa = [];
  }
}
