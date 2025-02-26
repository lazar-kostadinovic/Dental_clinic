import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PregledDTO } from '../../models/pregledDTO.model';
import { DateService } from '../../shared/date.service';
import { forkJoin, map, switchMap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unconfirmed-appointments-dentist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unconfirmed-appointments-dentist.component.html',
  styleUrl: './unconfirmed-appointments-dentist.component.css',
})
export class UnconfirmedAppointmentsDentistComponent {
  unconfirmed = false;
  unconfirmedAppointments: PregledDTO[] = [];
  @Input() dentistId!: string;
  @Input() dentistName!: string;
  @Output() appointmentTaken = new EventEmitter<void>();
  token = localStorage.getItem('token');
  daysOff: string[] = [];

  constructor(private http: HttpClient, private dateService: DateService) {}

  ngOnInit() {
    this.fetchUnconfirmedAppointments();
    this.fetchAllDaysOff();
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
          this.daysOff = daysOff;
          console.log(daysOff);
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

  takeAppointment(appointmentId: string) {
    const confirmedAppointment = this.unconfirmedAppointments.find(
      (appointment) => appointment.id === appointmentId
    );

    if (!confirmedAppointment) {
      alert('Pregled nije pronađen.');
      return;
    }

    const fullDate = confirmedAppointment.datum.toString();
    const date = new Date(fullDate).toISOString().split('T')[0];
    console.log(date.toString());

    if (this.daysOff.includes(date.toString())) {
      alert('Odabrali ste ovaj dan za slobodan. Pregled nije moguće preuzeti.');
      return;
    }

    this.http
      .put(
        `http://localhost:5001/Pregled/assignDentist/${appointmentId}/${this.dentistId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      )
      .subscribe({
        next: () => {
          Swal.fire('','Uspešno ste preuzeli pregled.','success');

          this.unconfirmedAppointments = this.unconfirmedAppointments.filter(
            (app) => app.id !== confirmedAppointment.id
          );

          this.sendAppointmentTakenEmail({
            toEmail: 'kostadinovicl999@gmail.com',
            patientName: confirmedAppointment.imePacijenta,
            appointmentDate: confirmedAppointment.datum,
            dentistName: this.dentistName,
          });

          this.appointmentTaken.emit();
        },
        error: (error) => {
          Swal.fire('',`${error.error}`,'error');
        },
      });
  }

  sendAppointmentTakenEmail(emailRequest: {
    toEmail?: string;
    patientName?: string;
    appointmentDate?: Date;
    dentistName?: string;
  }) {
    console.log(emailRequest);
    this.http
      .post(
        'http://localhost:5001/api/EmailControler/sendAppointmentTakenEmail',
        emailRequest,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      )
      .subscribe({
        next: () => {
          console.log('Email sent successfully.');
        },
        error: (error) => {
          console.error('Greška pri slanju emaila:', error);
        },
      });
  }

  fetchUnconfirmedAppointments() {
    this.unconfirmed = true;
    const token = localStorage.getItem('token');

    this.http
      .get<PregledDTO[]>('http://localhost:5001/Pregled/unconfirmed', {
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
          this.sortUnconfirmedAppointments();
        },
        error: (error) => {
          console.error('Greška pri dobijanju nepotvrđenih pregleda:', error);
        },
      });
  }

  formatDate(utcDate: Date): string {
    return this.dateService.formatDate(utcDate);
  }

  sortUnconfirmedAppointments() {
    console.log("sortiram");
    this.unconfirmedAppointments.sort(
      (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
    );
  }
}
