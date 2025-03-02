import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginModel = {
    email: '',
    password: '',
  };
  errorMessage: string | null = null;
  role?: number;

  constructor(private http: HttpClient, private router: Router) {}

  determineRole() {
    const emailLower = this.loginModel.email.toLowerCase();
  
    this.http
      .get<{ role: number }>(`http://localhost:5001/Admininstrator/GetUserRole/${emailLower}`)
      .pipe(
        catchError((error) => {
          console.error('Greška pri dohvatanju rola:', error);
          this.errorMessage = 'Pogrešni podaci. Pokušajte ponovo.';
          return of(null); 
        })
      )
      .subscribe((value) => {
        if (value && value.role !== undefined) {
          this.role = value.role;
          console.log(this.role);
  
          if (this.role === 0) {
            this.tryLoginAsPacijent();
          } else if (this.role === 1) {
            this.tryLoginAsStomatolog();
          } else if (this.role === 2) {
            this.tryLoginAsAdmin();
          } else {
            this.errorMessage = 'Nepoznata uloga.';
          }
        }
      });
  }
  
  onLogin() {
    this.determineRole();

  }
  tryLoginAsPacijent() {
    this.http
      .post<any>('http://localhost:5001/api/AuthPacijent', this.loginModel)
      .subscribe(
        (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', this.loginModel.email);
          localStorage.setItem('role', 'pacijent');
          this.router.navigate(['/patient-profile']);
        },
        (error) => {
          this.errorMessage = 'Pogrešni podaci. Pokušajte ponovo.';
        }
      );
  }

  tryLoginAsStomatolog() {
    this.http
      .post<any>('http://localhost:5001/api/AuthStomatolog', this.loginModel)
      .subscribe(
        (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', this.loginModel.email);
          localStorage.setItem('role', 'stomatolog');
          this.router.navigate(['/dentist-profile']);
        },
        (error) => {
          this.errorMessage = 'Pogrešni podaci. Pokušajte ponovo.';
        }
      );
  }

  tryLoginAsAdmin() {
    this.http
      .post<any>('http://localhost:5001/api/AuthAdmin', this.loginModel)
      .subscribe(
        (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', this.loginModel.email);
          localStorage.setItem('role', 'admin');

          this.router.navigate(['/dentist-management']);
        },
        (error) => {
          this.errorMessage = 'Pogrešni podaci. Pokušajte ponovo.';
        }
      );
  }
  registerPatientFetch() {
    this.router.navigate(['/register-patient']);
  }
}
