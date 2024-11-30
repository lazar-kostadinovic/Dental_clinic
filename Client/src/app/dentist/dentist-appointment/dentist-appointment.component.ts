import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PregledDTO } from '../../models/pregledDTO.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, switchMap } from 'rxjs';
import { DateService } from '../../shared/date.service';

@Component({
  selector: 'app-dentist-appointment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dentist-appointment.component.html',
  styleUrl: './dentist-appointment.component.css'
})
export class DentistAppointmentComponent {
  @Input() appointmentIds: string[] = [];
  @Output() appointmentsUpdated = new EventEmitter<string[]>(); 
  pregledList: PregledDTO[] = [];
  constructor(private http: HttpClient, private dateService: DateService) {}

  ngOnInit() {
    this.fetchPatientHistory();
    console.log(this.appointmentIds);
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
        next: (pregledi) => {
          this.pregledList = pregledi;
        },
        error: (error) => {
          console.error('Error fetching pregledi or patients:', error);
        },
      });
    }
  }
  deletePregled(id: string) {
    this.http.delete(`http://localhost:5001/Pregled/${id}`).subscribe({
      next: () => {
        this.pregledList = this.pregledList.filter((pregled) => pregled.id !== id);
        this.appointmentIds = this.appointmentIds.filter((appId) => appId !== id);

        this.appointmentsUpdated.emit(this.appointmentIds);

        alert('Pregled je uspešno obrisan.');
      },
      error: (error) => {
        console.error('Greška pri brisanju pregleda:', error);
      },
    });
  }
  
  getStatusLabel(status: string | number): string {
    const statusMap: { '0': string, '1': string, '2': string } = {
      '0': 'Predstojeći',
      '1': 'Prošli',
      '2': 'Otkazan',
    };

    return statusMap[status.toString() as '0' | '1' | '2'] || 'Nepoznat status';
  }

}
