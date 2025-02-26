import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-days-off',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './days-off.component.html',
  styleUrl: './days-off.component.css',
})
export class DaysOffComponent {
  @Input() dentistId!: string;
  daysOff: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(){
    this.fetchAllDaysOff();
  }

  fetchAllDaysOff(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const currentYear = new Date().getFullYear();

    this.http
      .get<string[]>(
        `http://localhost:5001/Stomatolog/GetAllDaysOff/${this.dentistId}`,
        { headers }
      )
      .subscribe({
        next: (daysOff) => {
          this.daysOff = daysOff
            .map((day) => new Date(day))
            .filter((date) => date.getFullYear() === currentYear)
            .sort((a, b) => a.getTime() - b.getTime())
            .map((date) => date.toLocaleDateString('sr-RS'));
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

  countCurrentYearDaysOff(): number {
    const currentYear = new Date().getFullYear();
    return this.daysOff.filter((dateString) => {
      //console.log(dateString);
      const parts = dateString.split('.').map((part) => part.trim());
      const year = parseInt(parts[2], 10);
      return year === currentYear;
    }).length;
  }
}
