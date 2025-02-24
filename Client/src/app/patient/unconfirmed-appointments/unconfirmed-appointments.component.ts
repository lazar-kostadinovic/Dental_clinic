import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DateService } from '../../shared/date.service';
import { HttpClient } from '@angular/common/http';
import { PregledDTO } from '../../models/pregledDTO.model';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-unconfirmed-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unconfirmed-appointments.component.html',
  styleUrl: './unconfirmed-appointments.component.css',
})
export class UnconfirmedAppointmentsComponent {
  @Input() patientId?: string;
  unconfirmedAppointments!: PregledDTO[];

  constructor(private dateService: DateService, private http: HttpClient,private route:ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params=>{
      this.patientId = params['patientId'];
    })
    console.log(this.patientId);
    this.getUnconfirmedAppointments();
    this.sortUnconfirmedAppointments();
  }

  getUnconfirmedAppointments(){
    this.http.get(`http://localhost:5001/Pacijent/getUnconfirmedAppointments/${this.patientId}`).subscribe({
      next: (data:any)=>{
        this.unconfirmedAppointments=data;
      }
    })
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
