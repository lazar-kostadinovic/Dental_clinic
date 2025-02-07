import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patients-management-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients-management-component.component.html',
  styleUrl: './patients-management-component.component.css',
})
export class PatientsManagementComponentComponent {
  stomatolozi: StomatologDTO[] = [];
  pacijenti: any[] = [];
  token = localStorage.getItem('token');
  showPatients = false;
  selectedPatientName: string = '';
  selectedPatientId: string = '';
  filteredPatients: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadPacijenti();
  }

  loadPacijenti(): void {
    const apiUrl = 'http://localhost:5001/Pacijent/basic';
    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        console.log(data);
        this.pacijenti = data;
        this.filteredPatients = data;
      },
      (error) => {
        console.error('Greška prilikom učitavanja pacijenata:', error);
      }
    );
  }

  filterPacijenti(): void {
    const searchValue = this.selectedPatientName.toLowerCase();
    this.filteredPatients = this.pacijenti.filter((pacijent) =>
      `${pacijent.name} - ${pacijent.email}`.toLowerCase().includes(searchValue)
    );
  }

  sendWarning(email: string, name: string, debt: number) {
    const emailPayload = {
      // toEmail: email,
      toEmail: 'kostadinovicl999@gmail.com',
      patientName: name,
      debt: debt,
    };

    console.log(emailPayload);
    this.http
      .post(
        'http://localhost:5001/api/EmailControler/sendWarningEmail',
        emailPayload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      )
      .subscribe({
        next: () =>
          Swal.fire('', 'Upozorednje je uspešno poslato pacijentu.', 'success'),
        error: (error) => console.error('Greška pri slanju emaila:', error),
      });
  }

  deletePatient(pacijentId: string) {
    if (!this.token) {
      Swal.fire('', 'Token nije pronađen!');
      return;
    }

    Swal.fire({
      title: 'Da li ste sigurni?',
      text: 'Da li ste sigurni da želite da obrišete ovog pacijenta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Obriši',
      cancelButtonText: 'Odustani',
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`,
        });

        this.http
          .delete(`http://localhost:5001/Pacijent/${pacijentId}`, { headers })
          .subscribe({
            next: () => {
              this.pacijenti = this.pacijenti.filter(
                (pacijent) => pacijent.id !== pacijentId
              );
              this.filterPacijenti();
              Swal.fire('', 'Pacijent je uspesno obrisan.', 'success');
            },
            error: (error) => {
              console.error('Greska pri brisanju pacijenta', error);
              Swal.fire(
                'Greška',
                'Došlo je do greške pri brisanju pacijenta.',
                'error'
              );
            },
          });
      }
    });
  }
  getImageUrl(imageName: string): string {
    return `http://localhost:5001/assets/${imageName}`;
  }
}
