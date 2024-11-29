import { Component, ElementRef, ViewChild, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PacijentDTO } from '../../models/pacijentDTO.model';
import { ScheduleAppointmentComponent } from '../schedule-appointment/schedule-appointment.component';
import { PatientAppointmentsComponent } from "../patient-appointments/patient-appointments.component";

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    PatientAppointmentsComponent,
    ScheduleAppointmentComponent,
    PatientAppointmentsComponent
],
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
})
export class PatientProfileComponent {
  patient!: PacijentDTO;
  email: string | null = null;
  showHistory = false;
  showDentists = false;
  showProfile = true;

  @ViewChild(PatientAppointmentsComponent)
  patientAppointmentsComponent?: PatientAppointmentsComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.email = localStorage.getItem('email');
    console.log(this.email);
    this.fetchPatientProfile();
  }

  onAppointmentsUpdated(updatedIds:string[]){
    this.patient.istorijaPregleda=updatedIds;
    console.log('Azurirana lista Id-ova',this.patient.istorijaPregleda);

  }
  fetchPatientProfile() {
    this.http
      .get<PacijentDTO>(
        `http://localhost:5001/Pacijent/GetPacijentByEmail/${this.email}`)
      .subscribe({
        next: (patientData) => {
          this.patient = patientData;
        },
        error: (error) => {
          console.error('Error fetching patient profile:', error);
        },
      });
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
    this.showProfile = !this.showProfile;
  }
  toggleDentists() {
    this.showDentists = !this.showDentists;
    this.showProfile = !this.showProfile;
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
          `http://localhost:5001/Pacijent/uploadSlika/${this.patient.id}`,
          formData
        )
        .subscribe({
          next: (response: any) => {
            console.log('Image uploaded successfully:', response);
            this.patient.slika = response.fileName;
          },
          error: (err) => {
            console.error('Error uploading image:', err);
          },
        });
    }
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:5001/assets/${imageName}`;
  }
  

  refreshPregledList() {
    this.patientAppointmentsComponent?.fetchPatientHistory();
    this.ngOnInit();
  }
}