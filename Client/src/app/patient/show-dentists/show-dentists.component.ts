import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { forkJoin } from 'rxjs';
import { KomentarDTO } from '../../models/komentarDTO';

@Component({
  selector: 'app-show-dentists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './show-dentists.component.html',
  styleUrl: './show-dentists.component.css'
})
export class ShowDentistComponent implements OnInit {
  @Input({ required: true }) patientId?: string;
  stomatolozi: StomatologDTO[] = [];
  selectedStomatologForComments: string | null = null;
  today: string = '';
  imePacijenata: { [key: string]: string } = {};
  selectedSpecijalizacija: string = '';

  newAppointment = {
    datum: '',
    vreme: '',
    opis: '',
  };

  komentariStomatologa: any[] = [];
  newComment = {
    komentar: '',
    ocena: 0,
  };

  specijalizacije = [
    'Oralni hirurg',
    'Ortodontija',
    'Parodontologija',
    'Endodoncija',
    'Pedijatrijska stomatologija',
    'Protetika',
    'Estetska stomatologija',
    'Oralna medicina',
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStomatolozi();
    const now = new Date();
    now.setDate(now.getDate() + 1);
    this.today = now.toISOString().split('T')[0];
  }

  loadStomatolozi(): void {
    const apiUrl = 'http://localhost:5001/Stomatolog/getDTOs';
    this.http.get<StomatologDTO[]>(apiUrl).subscribe(
      (data) => {
        this.stomatolozi = data.filter((s) => s.email !== 'admin@gmail.com');
        console.log('Učitali smo stomatologe:', this.stomatolozi);
      },
      (error) => {
        console.error('Greška prilikom učitavanja stomatologa:', error);
      }
    );
  }

  showReviews(idsKomentara: string[], idStomatologa: string): void {
    if (this.selectedStomatologForComments === idStomatologa) {
      this.selectedStomatologForComments = null;
      this.komentariStomatologa = [];
    } else {
      this.selectedStomatologForComments = idStomatologa;
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
          },
          error: (error) => {
            console.error('Greška pri učitavanju komentara:', error);
          },
        });
      }
    }
  }

  addComment(stomatologId: string): void {
    if (!this.newComment.komentar || !this.newComment.ocena) {
      alert('Molimo popunite sve podatke.');
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
      next: (response) => {
        console.log('Komentar dodat:', response);
        alert('Komentar uspešno dodat!');

        this.komentariStomatologa.push(commentPayload);

        if (this.patientId && !this.imePacijenata[this.patientId]) {
          this.getPacijentName(this.patientId);
        }

        this.newComment = { komentar: '', ocena: 0 };
      },
      error: (error) => {
        console.error('Greška pri dodavanju komentara:', error);
        alert('Došlo je do greške prilikom dodavanja komentara.');
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

  filterBySpecijalizacija(): void {
    if (this.selectedSpecijalizacija === '') {
      this.loadStomatolozi();
    } else {
      const apiUrl = `http://localhost:5001/Stomatolog/BySpecijalizacija/${this.selectedSpecijalizacija}`;
      this.http.get<StomatologDTO[]>(apiUrl).subscribe(
        (data) => {
          this.stomatolozi = data;
          console.log('Filtrirani stomatolozi:', this.stomatolozi);
        },
        (error) => {
          console.error('Greška pri filtriranju stomatologa:', error);
          this.stomatolozi = [];
        }
      );
    }
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:5001/assets/${imageName}`;
  }

  getSpecijalizacijaLabel(specijalizacija: number): string {
    return this.specijalizacije[specijalizacija] || 'Nepoznato';
  }
  
}
