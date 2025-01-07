import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { map, switchMap, forkJoin, iif, of } from 'rxjs';
import { PregledDTO } from '../../models/pregledDTO.model';
import { FormsModule } from '@angular/forms';
import { DateService } from '../../shared/date.service';
import { UnconfirmedAppointmentsComponent } from './unconfirmed-appointments/unconfirmed-appointments.component';
@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule,UnconfirmedAppointmentsComponent],
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.css',
})
export class PatientAppointmentsComponent implements OnInit {
  @Input() appointmentIds: string[] = [];
  @Input() showUnconfirmed: boolean = false;
  @Output() appointmentsUpdated = new EventEmitter<string[]>();
  unconfirmedAppointments: PregledDTO[] = [];
  pregledList: PregledDTO[] = [];
  updateForm = {
    opis: '',
  };
  // showUnconfirmed = false;
  isUpdateFormVisible1 = false;
  isUpdateFormVisible0 = false;
  selectedPregledId: string | null = null;
  selectedPregledStatus: number | null = null;
  today = new Date().toISOString().slice(0, 16);

  constructor(private http: HttpClient, private dateService: DateService) {}

  ngOnInit() {
    this.fetchPatientHistory();
  }
  
  formatDate(utcDate: Date): string {
    return this.dateService.formatDate(utcDate);
  }
  
  fetchPatientHistory() {
    console.log('fecujem');
    const pregledRequests = this.appointmentIds.map((id) =>
      this.http
        .get<PregledDTO>(`http://localhost:5001/Pregled/getPregledDTO/${id}`)
        .pipe(
          switchMap((pregled) =>
            iif(
              () => !!pregled.idStomatologa,
              this.http
                .get<{ ime: string; prezime: string }>(
                  `http://localhost:5001/Stomatolog/getStomatologDTO/${pregled.idStomatologa}`
                )
                .pipe(
                  map((stomatolog) => ({
                    ...pregled,
                    imeStomatologa: `${stomatolog.ime} ${stomatolog.prezime}`,
                  }))
                ),
              of({ ...pregled, imeStomatologa: 'Nepoznat stomatolog' })
            )
          )
        )
    );

    if (pregledRequests.length > 0) {
      console.log(pregledRequests);
      forkJoin(pregledRequests).subscribe({
        next: (pregledi) => {
          this.pregledList = this.sortPregledi(pregledi);
          this.unconfirmedAppointments = pregledi.filter(
            (pregled) => !pregled.idStomatologa
          );
          console.log(this.unconfirmedAppointments);
        },
        error: (error) => {
          console.error('Error fetching pregledi or stomatologs:', error);
        },
      });
    }
  }
  sortPregledi(pregledi: PregledDTO[]): PregledDTO[] {
    return pregledi.sort(
      (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
    );
  }

  deleteAppointment(id: string) {
    const token = localStorage.getItem('token') || '';
    console.log(token);

    this.http
      .delete(`http://localhost:5001/Pregled/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: () => {
          this.pregledList = this.pregledList.filter(
            (pregled) => pregled.id !== id
          );
          this.appointmentIds = this.appointmentIds.filter(
            (appId) => appId !== id
          );
          this.appointmentsUpdated.emit(this.appointmentIds);
          alert('Pregled je uspešno obrisan.');
        },
        error: (error) => {
          console.error('Greška pri brisanju pregleda:', error);
        },
      });
  }

  cancelAppointment(id: string) {
    const token = localStorage.getItem('token') || '';
    console.log(token);

    this.http
      .delete(`http://localhost:5001/Pregled/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: () => {
          this.pregledList = this.pregledList.filter(
            (pregled) => pregled.id !== id
          );
          this.appointmentIds = this.appointmentIds.filter(
            (appId) => appId !== id
          );
          this.appointmentsUpdated.emit(this.appointmentIds);
          alert('Pregled je uspešno otkazan.');
        },
        error: (error) => {
          console.error('Greška pri brisanju pregleda:', error);
        },
      });
  }

  openUpdateForm(id: string, status: number): void {
    const pregled = this.pregledList.find((p) => p.id === id);
    if (pregled) {
      this.updateForm.opis = pregled.opis;
    }
    this.selectedPregledId = id;
    this.selectedPregledStatus = status;
    if (pregled?.status === 0) {
      this.isUpdateFormVisible0 = true;
    } else {
      this.isUpdateFormVisible1 = true;
    }
  }

  updatePregled(): void {
    if (!this.selectedPregledId || !this.updateForm.opis) {
      alert('Molimo popunite sve podatke u formi.');
      return;
    }

    const apiUrl = `http://localhost:5001/Pregled/${this.selectedPregledId}/${this.updateForm.opis}`;

    this.http.put(apiUrl, {}).subscribe({
      next: (response) => {
        console.log('Pregled uspešno ažuriran:', response);
        alert('Pregled je ažuriran!');
        this.isUpdateFormVisible0 = false;
        this.isUpdateFormVisible1 = false;
        this.selectedPregledId = null;
        this.fetchPatientHistory();
      },
      error: (error) => {
        console.error('Greška pri ažuriranju pregleda:', error);
      },
    });
  }

  refreshPregledList() {
    console.log('Proba osvežavanja liste pregleda');
    this.fetchPatientHistory();
  }
}
