import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PregledDTO } from '../../models/pregledDTO.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, switchMap } from 'rxjs';
import { DateService } from '../../shared/date.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dentist-appointment',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './dentist-appointment.component.html',
  styleUrl: './dentist-appointment.component.css'
})
export class DentistAppointmentComponent {
  @Input() appointmentIds: string[] = [];
  @Output() appointmentsUpdated = new EventEmitter<string[]>(); 
  appointmentList : PregledDTO[] = [];
  filteredAppointmentList : PregledDTO[] = [];
  filteredAppointmentListForToday : PregledDTO[] = [];
  pacijentList: { id: string; name: string; email: string}[] = [];
  selectedPatientId: string = '';
  hasPastAppointments: boolean = false;
  hasUpcomingAppointments: boolean = false; 
  appointmentsForToday=false;

  constructor(private http: HttpClient, private dateService: DateService) {}

  ngOnInit() {
    this.fetchPatientHistory();
    this.fetchAllPatients();
  }

  formatDate(utcDate: Date): string {
    return this.dateService.formatDate(utcDate); 
  }

  fetchPatientHistory() {
    const pregledRequests = this.appointmentIds.map((id) =>
      this.http.get<PregledDTO>(`http://localhost:5001/Pregled/getPregledDTO/${id}`).pipe(
        switchMap((pregled) =>
          this.http.get<{ ime: string; prezime: string }>(`http://localhost:5001/Pacijent/getDTO/${pregled.idPacijenta}`).pipe(
            map((patient) => ({
              ...pregled,
              imePacijenta: `${patient.ime} ${patient.prezime}`,
            }))
          )
        )
      )
    );

    if (pregledRequests.length > 0) {
      forkJoin(pregledRequests).subscribe({
        next: (appointments) => {
          this.appointmentList  = appointments;
          this.filteredAppointmentList  = appointments;
          this.updateAppointmentIndicators();
        },
        error: (error) => {
          console.error('Error fetching appointments or patients:', error);
        },
      });
    }
  }

  filterAppointmentsForToday() {
    const today = new Date().setHours(0, 0, 0, 0);
    this.filteredAppointmentListForToday = this.appointmentList.filter((pregled) => {
      const pregledDate = new Date(pregled.datum).setHours(0, 0, 0, 0);
      return pregledDate === today;
      
    });
    this.updateAppointmentIndicators();
    this.appointmentsForToday=true;
  }
  

  fetchAllPatients() {
    this.http.get<{ id: string;name: string; email:string}[]>(
      'http://localhost:5001/Pacijent/basic'
    ).subscribe({
      next: (patients) => {
        this.pacijentList = patients;
        console.log(this.pacijentList)
      },
      error: (error) => {
        console.error('Error fetching patients:', error);
      },
    });
  }

  filterAppointmentsByPatient() {
    if (this.selectedPatientId) {
      this.filteredAppointmentList  = this.appointmentList .filter(
        (pregled) => pregled.idPacijenta === this.selectedPatientId
      );
    } else {
      this.filteredAppointmentList  = [...this.appointmentList ];
    }
    this.updateAppointmentIndicators();
  }

  deletePregled(id: string) {
    this.http.delete(`http://localhost:5001/Pregled/${id}`).subscribe({
      next: () => {
        this.appointmentList  = this.appointmentList .filter((pregled) => pregled.id !== id);
        this.appointmentIds = this.appointmentIds.filter((appId) => appId !== id);
        this.filterAppointmentsByPatient();
        this.appointmentsUpdated.emit(this.appointmentIds);
        alert('Pregled je uspešno obrisan.');
      },
      error: (error) => {
        console.error('Greška pri brisanju pregleda:', error);
      },
    });
  }

  updateAppointmentIndicators() {
    this.hasPastAppointments = this.filteredAppointmentList.some((pregled) => pregled.status === 1);
    this.hasUpcomingAppointments = this.filteredAppointmentList.some((pregled) => pregled.status === 0);
  }
}
