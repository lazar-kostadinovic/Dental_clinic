import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { PregledDTO } from '../../models/pregledDTO.model';
import { DateService } from '../../shared/date.service';
import { forkJoin, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-unconfirmed-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unconfirmed-appointments.component.html',
  styleUrl: './unconfirmed-appointments.component.css'
})
export class UnconfirmedAppointmentsComponent {
  unconfirmed=false;
  unconfirmedAppointments: PregledDTO[] = [];
  @Input () dentisId!:string;

  constructor(private http: HttpClient, private dateService: DateService) {}

  ngOnInit(){
    this.fetchUnconfirmedAppointments()
  }

  takeAppointment(appointmentId: string) {
    const token = localStorage.getItem('token');
  
    this.http
      .put(`http://localhost:5001/Pregled/assignDentist/${appointmentId}/${this.dentisId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: () => {
          alert('Uspešno ste preuzeli pregled.');
  
          // Pronađite pregled u unconfirmedAppointments i dodajte ga u predstojeće preglede
          const confirmedAppointment = this.unconfirmedAppointments.find(
            (appointment) => appointment.id === appointmentId
          );
  
          if (confirmedAppointment) {
            this.unconfirmedAppointments=this.unconfirmedAppointments.filter((app)=>app.id!=confirmedAppointment.id);
            // this.appointmentList = [...this.appointmentList, confirmedAppointment];
            // this.filteredAppointmentList = [...this.filteredAppointmentList, confirmedAppointment];
            // this.updateAppointmentIndicators();
          }
  
          // this.appointmentIds = [...this.appointmentIds, appointmentId];
        },
        error: (error) => {
          console.error('Greška pri preuzimanju pregleda:', error);
          alert('Došlo je do greške prilikom preuzimanja pregleda.');
        },
      });
  }

  fetchUnconfirmedAppointments() {
    this.unconfirmed=true;
    const token = localStorage.getItem('token');
    
    this.http.get<PregledDTO[]>('http://localhost:5001/Pregled/unconfirmed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        switchMap((appointments) => {
          const appointmentRequests = appointments.map((pregled) =>
            this.http
              .get<{ ime: string; prezime: string }>(
                `http://localhost:5001/Pacijent/getDTO/${pregled.idPacijenta}`
              )
              .pipe(
                map((patient) => ({
                  ...pregled,
                  imePacijenta: `${patient.ime} ${patient.prezime}`,
                }))
              )
          );
  
          return forkJoin(appointmentRequests);
        })
      )
      .subscribe({
        next: (appointmentsWithPatientNames) => {
          this.unconfirmedAppointments = appointmentsWithPatientNames;
          console.log(
            'Nepotvrđeni pregledi sa imenima pacijenata:',
            this.unconfirmedAppointments
          );
        },
        error: (error) => {
          console.error('Greška pri dobijanju nepotvrđenih pregleda:', error);
        },
      });
  }

  formatDate(utcDate: Date): string {
    return this.dateService.formatDate(utcDate); 
  }
}
