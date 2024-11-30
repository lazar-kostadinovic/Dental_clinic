import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { forkJoin } from 'rxjs';
import { KomentarDTO } from '../../models/komentarDTO';

@Component({
  selector: 'app-schedule-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.css'],
})
export class ScheduleAppointmentComponent implements OnInit {
  @Input({ required: true }) patientId?: string;
  @Output() appointmentScheduled = new EventEmitter<void>();
  stomatolozi: StomatologDTO[] = [];
  selectedStomatologForAppointment: string | null = null;
  selectedStomatologForComments: string | null = null;
  availableTimeSlots: string[] = [];
  daysOff: string[] = [];
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

  openForm(idStomatologa: string): void {
    if (this.selectedStomatologForAppointment === idStomatologa) {
      this.closeForm();
    } else {
      this.selectedStomatologForAppointment = idStomatologa;
      this.availableTimeSlots = [];
      this.fetchAllDaysOff(idStomatologa);
    }

  }

  loadAvailableTimeSlots(idStomatologa: string, datum: string): void {
    const apiUrl = `http://localhost:5001/Pregled/availableTimeSlots/${idStomatologa}/${datum}`;
    this.http.get<string[]>(apiUrl).subscribe(
      (data) => {
        this.availableTimeSlots = data;
        console.log('Dostupni termini:', this.availableTimeSlots);
      },
      (error) => {
        console.error('Greška pri učitavanju slobodnih termina:', error);
      }
    );
  }

  fetchAllDaysOff(idStomatologa: string): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<string[]>(
        `http://localhost:5001/Stomatolog/GetAllDaysOff/${idStomatologa}`,
        { headers }
      )
      .subscribe({
        next: (daysOff) => {
          this.daysOff = daysOff

            .filter((day) => new Date(day).getTime() > new Date().getTime())
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        },
        error: (error) => {
          console.error('Greška prilikom preuzimanja slobodnih dana:', error);
          alert(
            error.error?.message ||
              'Došlo je do greške prilikom preuzimanja slobodnih dana.'
          );
        },
      });

      console.log(this.daysOff);
  }

  isDayDisabled(date: string): boolean {
    console.log('Days off:', this.daysOff);
    console.log(this.daysOff.includes(date));
    return this.daysOff.includes(date);
  }

  scheduleAppointment(): void {
    if (
      !this.patientId ||
      !this.selectedStomatologForAppointment ||
      !this.newAppointment.datum ||
      !this.newAppointment.vreme ||
      !this.newAppointment.opis
    ) {
      alert('Molimo popunite sve podatke.');
      return;
    }

    const dateTimeString = `${this.newAppointment.datum}T${this.newAppointment.vreme}`;
    const apiUrl = `http://localhost:5001/Pregled/schedule/${this.selectedStomatologForAppointment}/${this.patientId}/${dateTimeString}/${this.newAppointment.opis}`;
    console.log(apiUrl);
    this.http.post(apiUrl, {}).subscribe({
      next: (response) => {
        console.log('Pregled zakazan uspešno:', response);
        alert('Pregled je zakazan uspešno!');
        this.appointmentScheduled.emit();
        this.closeForm();
      },
      error: (error) => {
        console.error('Greška pri zakazivanju pregleda:', error);
      },
    });
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

  closeForm(): void {
    this.selectedStomatologForAppointment = null;
    this.newAppointment = { datum: '', vreme: '', opis: '' };
    this.availableTimeSlots = [];
  }
}
