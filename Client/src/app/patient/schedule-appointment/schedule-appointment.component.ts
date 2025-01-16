import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { forkJoin } from 'rxjs';
import { KomentarDTO } from '../../models/komentarDTO';
import { PacijentDTO } from '../../models/pacijentDTO.model';

@Component({
  selector: 'app-schedule-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.css'],
})
export class ScheduleAppointmentComponent implements OnInit {
  patient!: PacijentDTO;
  email: string | null = null;
  @Output() appointmentScheduled = new EventEmitter<string>();
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    this.today = now.toISOString().split('T')[0];
    this.email = localStorage.getItem('email');
    this.fetchPatientProfile();
  }

    fetchPatientProfile() {
      this.http
        .get<PacijentDTO>(
          `http://localhost:5001/Pacijent/GetPacijentByEmail/${this.email}`
        )
        .subscribe({
          next: (patientData) => {
            this.patient = patientData;
          },
          error: (error) => {
            console.error('Error fetching patient profile:', error);
          },
        });
    }

  openForm(idStomatologa: string): void {
    if (this.selectedStomatologForAppointment === idStomatologa) {
      this.closeForm();
    } else {
      this.selectedStomatologForAppointment = idStomatologa;
      this.availableTimeSlots = [];

      this.selectedStomatologForComments = null;
    }
  }

  loadAvailableTimeSlots(datum: string): void {
    const apiUrl = `http://localhost:5001/Pregled/availableTimeSlots/${datum}`;
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

  scheduleNextAppointment(): void {
    const apiUrl = `http://localhost:5001/Pregled/scheduleNextAvailable/${this.patient.id}`;
    this.http.post(apiUrl, {}).subscribe({
      next: (response: any) => {
        console.log(response);
        const scheduledDate = response?.datum;
        const date = new Date(scheduledDate);

        const day = date.getUTCDate();
        const month = date.toLocaleString('en-US', {
          month: 'long',
          timeZone: 'UTC',
        });
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');

        const formattedMessage = `Pregled je zakazan uspešno za ${day}. ${month} ${year}. u ${hours}:${minutes}!`;
        alert(`${formattedMessage}!`);
        this.appointmentScheduled.emit();
        this.closeForm();
      },
      error: (error) => {
        console.error('Greška pri zakazivanju pregleda:', error);
      },
    });
  }

  scheduleAppointment(): void {
    if (
      !this.patient.id ||
      !this.newAppointment.datum ||
      !this.newAppointment.vreme ||
      !this.newAppointment.opis
    ) {
      console.log(  this.patient.id,
        this.newAppointment.datum ,
        this.newAppointment.vreme ,
        this.newAppointment.opis);
      alert('Molimo popunite sve podatke.');
      return;
    }

    const dateTimeString = `${this.newAppointment.datum}T${this.newAppointment.vreme}`;
    const apiUrl = `http://localhost:5001/Pregled/schedule/${this.patient.id}/${dateTimeString}/${this.newAppointment.opis}`;
    console.log(apiUrl);
    this.http.post(apiUrl, {}).subscribe({
      next: (response:any) => {
        const newAppointmentId = response.id; 
        console.log('Pregled zakazan uspešno:', response);
        this.appointmentScheduled.emit(newAppointmentId);
        alert('Pregled je zakazan uspešno!');
        this.closeForm();
      },
      error: (error) => {
        console.error('Greška pri zakazivanju pregleda:', error);
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

  closeForm(): void {
    this.selectedStomatologForAppointment = null;
    this.newAppointment = { datum: '', vreme: '', opis: '' };
    this.availableTimeSlots = [];
  }
}
