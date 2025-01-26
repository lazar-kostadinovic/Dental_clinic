import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PacijentDTO } from '../../../models/pacijentDTO.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dentist-schedule',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dentist-schedule.component.html',
  styleUrls: ['./dentist-schedule.component.css'],
})
export class DentistScheduleComponent {
  @Input() dentistId!: string;
  @Input() patients: Array<{
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    debt: number;
  }> = [];
  daysOff: string[] = [];

  @Output() appointmentScheduled = new EventEmitter<string>();
  @Output() appointmentCanceled = new EventEmitter<void>();

  availableTimeSlots: string[] = [];
  newAppointment = {
    datum: '',
    vreme: '',
    opis: '',
  };
  selectedPatient: string | null = null;
  tomorrow: string = '';
  selectedPatientName: string = '';
  selectedPatientId: string = '';
  selectedPatientDebt: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const now = new Date();
    now.setDate(now.getDate());
    this.tomorrow = now.toISOString().split('T')[0];
    this.fetchAllDaysOff();
    console.log(new Date().getTime());
  }

  fetchAllDaysOff(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<string[]>(
        `http://localhost:5001/Stomatolog/GetAllDaysOff/${this.dentistId}`,
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
          Swal.fire(
            '',
            error.error?.message ||
              'Došlo je do greške prilikom preuzimanja slobodnih dana.',
            'error'
          );
        },
      });
  }

  isDayDisabled(date: string): boolean {
    return this.daysOff.includes(date);
  }

  loadAvailableTimeSlots(dentistId: string, date: string): void {
    const apiUrl = `http://localhost:5001/Pregled/availableTimeSlots/${dentistId}/${date}`;
    this.http.get<string[]>(apiUrl).subscribe(
      (timeSlots) => {
        this.availableTimeSlots = timeSlots;
      },
      (error) => {
        console.error('Error fetching time slots:', error);
      }
    );
  }

  submitAppointment(): void {
    if (!this.newAppointment.datum || !this.newAppointment.vreme) {
      Swal.fire('', 'Molimo popunite sva polja.', 'warning');
      return;
    }

    const dateTimeString = `${this.newAppointment.datum}T${this.newAppointment.vreme}`;
    const apiUrl = `http://localhost:5001/Pregled/schedule/${this.dentistId}/${this.selectedPatientId}/${dateTimeString}/${this.newAppointment.opis}`;
    console.log(apiUrl);

    this.http.post(apiUrl, {}).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          Swal.fire('', `Pregled je uspešno zakazan!`, 'success');
          const newAppointmentId = response.id;

          console.log('Zakazani pregled:', response);
          this.appointmentScheduled.emit(newAppointmentId);
          this.resetForm();
        } else {
          Swal.fire('Zakazivanje uspešno, ali ID nije vraćen.');
        }
      },
      error: (error) => {
        console.error('Greška pri zakazivanju pregleda:', error);
      },
    });
  }

  onPatientSelected() {
    const selectedPatient = this.patients.find(
      (pacijent) =>
        `${pacijent.name} - ${pacijent.email}`.toLowerCase() ===
        this.selectedPatientName.toLowerCase()
    );

    if (selectedPatient) {
      this.selectedPatientId = selectedPatient.id;
      this.selectedPatientDebt = selectedPatient.debt;
    } else {
      this.selectedPatientId = '';
      this.selectedPatientDebt = 0;
    }
  }

  resetForm(): void {
    this.newAppointment = { datum: '', vreme: '', opis: '' };
    this.availableTimeSlots = [];
    this.selectedPatientName = '';
    this.selectedPatientId = '';
    this.selectedPatientDebt = 0;
    this.appointmentCanceled.emit();
  }
}
