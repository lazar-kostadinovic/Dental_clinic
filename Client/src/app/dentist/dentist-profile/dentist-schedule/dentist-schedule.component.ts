import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dentist-schedule',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './dentist-schedule.component.html',
  styleUrls: ['./dentist-schedule.component.css'],
})
export class DentistScheduleComponent {
  @Input() dentistId!: string; 
  // @Input() today!: string; 
  @Input() patients: Array<{ id: string; name: string }> = []; 
  @Output() appointmentScheduled = new EventEmitter<void>(); 

  availableTimeSlots: string[] = [];
  newAppointment = {
    datum: '',
    vreme: '',
    opis: '',
  };
  selectedPatient: string | null = null;
  tomorrow: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(){
    const now = new Date();
    now.setDate(now.getDate() + 1);
    this.tomorrow = now.toISOString().split('T')[0];
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
    if (!this.selectedPatient || !this.newAppointment.datum || !this.newAppointment.vreme) {
      alert('Molimo popunite sva polja.');
      return;
    }

    const dateTimeString = `${this.newAppointment.datum}T${this.newAppointment.vreme}`;
    const apiUrl = `http://localhost:5001/Pregled/schedule/${this.dentistId}/${this.selectedPatient}/${dateTimeString}/${this.newAppointment.opis}`;
    
    this.http.post(apiUrl, {}).subscribe({
      next: () => {
        alert('Pregled je uspešno zakazan!');
        this.appointmentScheduled.emit(); // Obavesti roditeljsku komponentu
        this.resetForm();
      },
      error: (error) => {
        console.error('Error scheduling appointment:', error);
      },
    });
  }

  resetForm(): void {
    this.newAppointment = { datum: '', vreme: '', opis: '' };
    this.availableTimeSlots = [];
    this.selectedPatient = null;
  }
}
