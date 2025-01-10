import { Component, ViewEncapsulation } from '@angular/core';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dentists-management-component',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './dentists-management-component.component.html',
  styleUrl: './dentists-management-component.component.css',
})
export class DentistsManagementComponentComponent {
  stomatolozi: StomatologDTO[] = [];
  pacijenti: any[] = [];
  token = localStorage.getItem('token');
  filteredPatients: any[] = [];
  daysOffMap: { [key: string]: string[] } = {};
  showDayOff: { [key: string]: boolean } = {};
  selectedDate: { [dentistId: string]: string } = {};


  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadStomatolozi();
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

  fetchAllDaysOff(dentistId: string): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const currentYear = new Date().getFullYear();
  
    this.http
      .get<string[]>(
        `http://localhost:5001/Stomatolog/GetAllDaysOff/${dentistId}`,
        { headers }
      )
      .subscribe({
        next: (daysOff) => {
          this.daysOffMap[dentistId] = daysOff
            .map((day) => new Date(day))
            .filter((date) => date.getFullYear() === currentYear)
            .sort((a, b) => a.getTime() - b.getTime())
            .map((date) => date.toLocaleDateString('sr-RS'));
          this.showDayOff[dentistId] = true;
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
  

  toggleDayOffVisibility(dentistId: string): void {
    this.showDayOff[dentistId] = !this.showDayOff[dentistId];
  }
  
  countCurrentYearDaysOff(dentistId: string): number {
    const currentYear = new Date().getFullYear();
    const daysOff = this.daysOffMap[dentistId] || [];
    return daysOff.filter((dateString) => {
      const parts = dateString.split('.').map((part) => part.trim()); 
      const year = parseInt(parts[2], 10);
      return year === currentYear;
    }).length;
  }

  submitDayOff(dentistId: string): void {
    const selected = this.selectedDate[dentistId];
    if (!selected) {
      alert('Molimo odaberite datum.');
      return;
    }
  
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http
      .post(
        `http://localhost:5001/Stomatolog/addDayOff/${dentistId}/${selected}`,
        null,
        { headers }
      )
      .subscribe({
        next: () => {
          alert(`Slobodan dan za ${selected} je dodat.`);
          this.selectedDate[dentistId] = '';
          this.fetchAllDaysOff(dentistId);
        },
        error: (err) => {
          console.error('Greška prilikom dodavanja slobodnog dana:', err.error);
          alert(err.error?.message || 'Došlo je do greške prilikom dodavanja.');
        },
      });
  }
  
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

  getDentistShift(shift: boolean) {
    return shift === true ? ' prva' : ' druga';
  }
}
