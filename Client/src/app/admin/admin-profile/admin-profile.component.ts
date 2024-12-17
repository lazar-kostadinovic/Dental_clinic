import { Component } from '@angular/core';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css',
})
export class AdminProfileComponent {
  stomatolozi: StomatologDTO[] = [];
  pacijenti: any[] = []; 
  token = localStorage.getItem('token');
  showPatients=false;
  selectedPatientName: string = '';
  selectedPatientId: string = '';
  filteredPatients: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadStomatolozi();
    this.loadPacijenti();
    console.log(this.token);
  }

  togglePatients(){
    this.showPatients=!this.showPatients;
  }

  loadStomatolozi(): void {
    const apiUrl = 'http://localhost:5001/Stomatolog/getDTOs';
    this.http.get<StomatologDTO[]>(apiUrl).subscribe(
      (data) => {
        this.stomatolozi = data.filter(
          (stomatolog) => stomatolog.email !== 'admin@gmail.com'
        );
        console.log('Učitali smo stomatologe:', this.stomatolozi);
      },
      (error) => {
        console.error('Greška prilikom učitavanja stomatologa:', error);
      }
    );
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

  getSpecijalizacijaLabel(specijalizacija: number): string {
    const specijalizacije = [
      'Oralni hirurg',
      'Ortodontija',
      'Parodontologija',
      'Endodoncija',
      'Pedijatrijska stomatologija',
      'Protetika',
      'Estetska stomatologija',
      'Oralna medicina',
    ];
    return specijalizacije[specijalizacija] || 'Nepoznato';
  }

  deleteDentist(stomatologId: string) {
    if (!this.token) {
      alert('Token nije pronađen!');
      return;
    }
    const confirmation = window.confirm(
      'Da li ste sigurni da želite da obrišete ovog stomatologa?'
    );

    if (!confirmation) {
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    this.http
      .delete(`http://localhost:5001/Stomatolog/${stomatologId}`, { headers })
      .subscribe({
        next: () => {
          this.stomatolozi = this.stomatolozi.filter(
            (stomatolog) => stomatolog.id !== stomatologId
          );
          alert('Stomatolog je uspesno obrisan.');
        },
        error: (error) => {
          console.error('Greska pri brisanju stomatologa', error);
          alert('Došlo je do greške pri brisanju stomatologa.');
        },
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
  changeShift(stomatologId: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    this.http
      .put(
        `http://localhost:5001/Stomatolog/changeShift/${stomatologId}`,
        {},
        { headers }
      )
      .subscribe({
        next: () => {
          alert('Promenjena smena stomatologa');
          this.loadStomatolozi();
        },
        error: (error) => {
          alert('Greska prilikom menjanja smene');
        },
      });
  }

  navigateToRegisterDentist() {
    this.router.navigate(['/register-dentist']);
  }
  getImageUrl(imageName: string): string {
    return `http://localhost:5001/assets/${imageName}`;
  }

  getDentistShift(shift:boolean)
  {
    return shift===true?" prva":" druga";
  }
}
