import { Component } from '@angular/core';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dentists-management-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dentists-management-component.component.html',
  styleUrl: './dentists-management-component.component.css',
})
export class DentistsManagementComponentComponent {
  stomatolozi: StomatologDTO[] = [];
  pacijenti: any[] = [];
  token = localStorage.getItem('token');
  filteredPatients: any[] = [];

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
