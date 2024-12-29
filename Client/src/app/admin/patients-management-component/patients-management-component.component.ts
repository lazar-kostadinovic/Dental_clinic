import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patients-management-component',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './patients-management-component.component.html',
  styleUrl: './patients-management-component.component.css'
})
export class PatientsManagementComponentComponent {
  stomatolozi: StomatologDTO[] = [];
    pacijenti: any[] = []; 
    token = localStorage.getItem('token');
    showPatients=false;
    selectedPatientName: string = '';
    selectedPatientId: string = '';
    filteredPatients: any[] = [];
  
    constructor(private http: HttpClient, private router: Router) {}
  
    ngOnInit(): void {
      this.loadPacijenti();
      console.log(this.token);
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
  
    sendWarning(email :string,name:string,debt:number){
      
      const emailPayload = {
        // toEmail: email,
        toEmail: "kostadinovicl999@gmail.com",
        patientName: name,
        debt: debt,
      };
  
      console.log(emailPayload);
      this.http
        .post('http://localhost:5001/api/EmailControler/sendWarningEmail', emailPayload, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .subscribe({
          next: () => alert('Upozorednje je uspešno poslato pacijentu.'),
          error: (error) => console.error('Greška pri slanju emaila:', error),
        });
    }
  
    deletePatient(pacijentId: string) {
      if (!this.token) {
        alert('Token nije pronađen!');
        return;
      }
      const confirmation = window.confirm(
        'Da li ste sigurni da želite da obrišete ovog pacijenta?'
      );
  
      if (!confirmation) {
        return;
      }
  
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
  
      this.http
        .delete(`http://localhost:5001/Pacijent/${pacijentId}`, { headers })
        .subscribe({
          next: () => {
            this.pacijenti = this.pacijenti.filter((pacijent) => pacijent.id !== pacijentId);
            this.filterPacijenti();
            alert('Pacijent je uspesno obrisan.');
          },
          error: (error) => {
            console.error('Greska pri brisanju pacijenta', error);
            alert('Došlo je do greške pri brisanju pacijenta.');
          },
        });
    }
}
