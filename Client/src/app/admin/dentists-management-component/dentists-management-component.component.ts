import { Component, ViewEncapsulation } from '@angular/core';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dentists-management-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dentists-management-component.component.html',
  styleUrl: './dentists-management-component.component.css',
})
export class DentistsManagementComponentComponent {
  selectedDentistId?: string;
  stomatolozi: StomatologDTO[] = [];
  pacijenti: any[] = [];
  token = localStorage.getItem('token');
  filteredPatients: any[] = [];
  daysOffMap: { [key: string]: string[] } = {};
  showDayOff: { [key: string]: boolean } = {};
  selectedDateStart: { [dentistId: string]: string } = {};
  selectedDateEnd: { [dentistId: string]: string } = {};
  activeDentistId: string | null = null;
  activeDentist: StomatologDTO | null = null;
  stomatoloziPrvaSmena: any[] = [];
  stomatoloziDrugaSmena: any[] = [];
  showPrvaSmena: boolean = true;
  showDrugaSmena: boolean = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadStomatolozi();
  }

  loadStomatolozi(): void {
    const apiUrl = 'http://localhost:5001/Stomatolog/getDTOs';
    this.http.get<StomatologDTO[]>(apiUrl).subscribe(
      (data) => {
        this.stomatolozi = data;
        this.stomatoloziPrvaSmena = this.stomatolozi.filter(s => s.prvaSmena);
        this.stomatoloziDrugaSmena = this.stomatolozi.filter(s => !s.prvaSmena);
      },
      (error) => {
        console.error('Greška prilikom učitavanja stomatologa:', error);
      }
    );
  }

  toggleShift(shift: string): void {
    if (shift === 'prvaSmena') {
      this.showPrvaSmena = !this.showPrvaSmena;
    } else if (shift === 'drugaSmena') {
      this.showDrugaSmena = !this.showDrugaSmena;
    }
  }

  fetchAllDaysOff(dentistId: string): void {
    this.setActiveDentist(dentistId);
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
          console.error('Greška prilikom preuzimanja neradnih dana:', error);
          Swal.fire('',
            error.error?.message ||
              'Došlo je do greške prilikom preuzimanja neradnih dana.','error'
          );
        },
      });
  }

  setActiveDentist(dentistId: string): void {
    this.activeDentistId = dentistId;
    this.activeDentist =
      this.stomatolozi.find((d) => d.id === dentistId) || null;
  }

  resetActiveDentist(): void {
    this.activeDentist = null;
  }

  toggleDayOffVisibility(dentistId: string): void {
    this.showDayOff[dentistId] = !this.showDayOff[dentistId];
  }

  closeActiveDentist(): void {
    this.activeDentistId = null;
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
    const selectedStart = this.selectedDateStart[dentistId];
    const selectedEnd = this.selectedDateEnd[dentistId];
    if (!selectedStart || !selectedEnd) {
      Swal.fire('','Molimo vas unesite pocetni i krajnji datum.','warning');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .post(
        `http://localhost:5001/Stomatolog/addDaysOff/${dentistId}/${selectedStart}/${selectedEnd}`,
        {},
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          Swal.fire('',`${response.message}`,'success');
          this.selectedDateStart[dentistId] = '';
          this.selectedDateEnd[dentistId] = '';
          this.fetchAllDaysOff(dentistId);
        },
        error: (err) => {
          Swal.fire('',`Greška prilikom dodavanja neradnog dana:${err.error}`,'error');
        },
      });
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getSpecijalizacijaLabel(specijalizacija: number): string {
    const specijalizacije = [
      'Opsta stomatologija',
      'Oralna hirugija',
      'Ortodontija',
      'Parodontologija',
      'Endodoncija',
      'Pedijatrijska stomatologija',
      'Protetika',
      'Estetska stomatologija',
    ];
    return specijalizacije[specijalizacija] || 'Nepoznato';
  }

  deleteDentist(stomatologId: string) {
    if (!this.token) {
      Swal.fire({
        icon: 'warning',
        title: 'Token nije pronađen!',
      });
      return;
    }

    Swal.fire({
      title: 'Da li ste sigurni?',
      text: 'Da li ste sigurni da želite da obrišete ovog stomatologa?',
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
          .delete(`http://localhost:5001/Stomatolog/${stomatologId}`, { headers })
          .subscribe({
            next: () => {
              this.stomatolozi = this.stomatolozi.filter(
                (stomatolog) => stomatolog.id !== stomatologId
              );
              Swal.fire({
                icon: 'success',
                title: 'Uspeh!',
                text: 'Stomatolog je uspešno obrisan.',
              });
            },
            error: (error) => {
              console.error('Greška pri brisanju stomatologa', error);
              Swal.fire({
                icon: 'error',
                title: 'Greška!',
                text: 'Došlo je do greške pri brisanju stomatologa.',
              });
            },
          });
      }
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
          Swal.fire('','Promenjena smena stomatologa','success');
          this.loadStomatolozi();
        },
        error: (error) => {
          Swal.fire('','Greska prilikom menjanja smene','error');
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
