import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DateService } from '../../../shared/date.service';
import { HttpClient } from '@angular/common/http';
import { PregledDTO } from '../../../models/pregledDTO.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unconfirmed-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unconfirmed-appointments.component.html',
  styleUrl: './unconfirmed-appointments.component.css',
})
export class UnconfirmedAppointmentsComponent {
  @Input() unconfirmedAppointments!: PregledDTO[];

  constructor(private dateService: DateService, private http: HttpClient) {}

  ngOnInit(){
    this.sortUnconfirmedAppointments();
  }

  formatDate(utcDate: Date): string {
    return this.dateService.formatDate(utcDate);
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
          Swal.fire({
            icon: 'success',
            title: '',
            text: 'Pregled je uspešno otkazan!',
          });
          this.unconfirmedAppointments = this.unconfirmedAppointments.filter(
            (appointmet) => appointmet.id != id
          );
        },
        error: (error) => {
          console.error('Greška pri brisanju pregleda:', error);
        },
      });
  }

  sortUnconfirmedAppointments() {
    this.unconfirmedAppointments.sort(
      (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
    );
  }
}
