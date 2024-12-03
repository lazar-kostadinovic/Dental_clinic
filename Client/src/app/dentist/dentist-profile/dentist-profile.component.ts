import { Component, ElementRef, ViewChild } from '@angular/core';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DentistAppointmentComponent} from '../dentist-appointment/dentist-appointment.component';
import { FormsModule } from '@angular/forms';
import { DentistScheduleComponent } from './dentist-schedule/dentist-schedule.component';

@Component({
  selector: 'app-dentist-profile',
  standalone: true,
  imports: [CommonModule, DentistAppointmentComponent,FormsModule,DentistScheduleComponent],
  templateUrl: './dentist-profile.component.html',
  styleUrls: ['./dentist-profile.component.css'],
})
export class DentistProfileComponent {
  dentist!: StomatologDTO;
  showHistory = false;
  email: string | null = null;
  showAppointments = false;
  showProfile = true;
  showDayOffForm =false;
  showAppointmentForm = false;

  availableTimeSlots: string[] = [];
  selectedDate: string | null = null; 
  patients: Array<{ id: string; name: string }> = [];
  selectedPatient: string | null = null;
  daysOff: string[] = []; 
  newAppointment = {
    datum: '',
    vreme: '',
    opis: '',
  };

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.email = localStorage.getItem('email');
    this.fetchDentistProfile();
  }

    onAppointmentsUpdated(updatedIds: string[]) {
    this.dentist.predstojeciPregledi = updatedIds; 
    console.log('Roditelj dobio ažuriranu listu ID-ova:', this.dentist.predstojeciPregledi);
  }

  fetchDentistProfile() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<StomatologDTO>(
        `http://localhost:5001/Stomatolog/GetStomatologByEmail/${this.email}`,
        { headers }
      )
      .subscribe({
        next: (dentistData) => {
          this.dentist = dentistData;
        },
        error: (error) => {
          console.error('Error fetching dentist profile:', error);
        },
      });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.http
        .post(
          `http://localhost:5001/Stomatolog/uploadSlika/${this.dentist.id}`,
          formData
        )
        .subscribe({
          next: (response: any) => {
            console.log('Image uploaded successfully:', response);
            this.dentist.slika = response.fileName;
          },
          error: (err) => {
            console.error('Error uploading image:', err);
          },
        });
    }
  }

  toggleAppointmentForm() {
    this.showAppointmentForm = !this.showAppointmentForm;
    this.showDayOffForm=false;
    if (this.showAppointmentForm) {
      this.fetchPatients();
    }
  }
  
  fetchPatients() {
    this.http.get<{ id: string; name: string }[]>(`http://localhost:5001/Pacijent/basic`)
      .subscribe({
        next: (patientList) => {
          this.patients = patientList;
        },
        error: (error) => {
          console.error('Error fetching patients:', error);
        }
      });
  }
  onAppointmentScheduled(): void {
    this.showAppointmentForm = false; 
    this.fetchDentistProfile(); 
  }
  
  
  getImageUrl(imageName: string): string {
    return `http://localhost:5001/assets/${imageName}`;
  }
  
  toggleAppointmentsHistory() {
    this.showAppointments = !this.showAppointments;
    this.showProfile = !this.showProfile;
    this.showAppointmentForm = false;
    this.showDayOffForm=false;
  }
  closeForm(): void {
    this.newAppointment = { datum: '', vreme: '', opis: '' };
    this.availableTimeSlots = [];
  }

  toggleDayOffForm(){
    this.showDayOffForm=!this.showDayOffForm;
    this.showAppointmentForm=false;
  }

  submitDayOff(): void {
    if (!this.selectedDate) {
      alert('Molimo odaberite datum.');
      return;
    }
  
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
  
    this.http.post(`http://localhost:5001/Stomatolog/addDayOff/${this.dentist.id}/${this.selectedDate}`,null, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Slobodan dan uspešno dodat:', response);
          alert(`Slobodan dan za ${this.selectedDate} je dodat.`);
          this.selectedDate = null;
          // this.showDayOffForm = false;
          this.fetchAllDaysOff()
          this.fetchDentistProfile();
        },
        error: (err) => {
          console.error('Greška prilikom dodavanja slobodnog dana:', err.error);
          alert(`Vec ste postavili ovaj dan za slobodan.`);
        },
      });
  }

  fetchAllDaysOff(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<string[]>(
        `http://localhost:5001/Stomatolog/GetAllDaysOff/${this.dentist.id}`,
        { headers }
      )
      .subscribe({
        next: (daysOff) => {
          this.daysOff = daysOff.map((day) =>
            new Date(day).toLocaleDateString('sr-RS')
          );
        },
        error: (error) => {
          console.error('Greška prilikom preuzimanja slobodnih dana:', error);
          alert(
            error.error?.message ||
              'Došlo je do greške prilikom preuzimanja slobodnih dana.'
          );
        },
      });
  }
  
}
