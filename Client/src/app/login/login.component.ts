import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginModel = {
    email: '',
    password: '',
  };
  errorMessage: string | null = null; 

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.errorMessage = null;
    const emailLower = this.loginModel.email.toLowerCase();

    this.loginModel.email = emailLower;

    console.log(this.loginModel);
    this.http
      .post<any>('http://localhost:5001/api/Auth', this.loginModel)
      .subscribe(
        (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', this.loginModel.email);
          localStorage.setItem('role', "pacijent");
          this.router.navigate(['/home']);
        },
        (error) => {
          if (error.status === 401 || error.status === 500) {
            this.tryLoginAsStomatolog();
          } else {
            this.errorMessage = 'Pogrešni podaci. Pokušajte ponovo.';
          }
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
          localStorage.setItem('role', "stomatolog");
          this.router.navigate(['/home']);
        },
        (error) => {
          this.errorMessage = 'Pogrešni podaci. Pokušajte ponovo.';
        }
      );
  }
  registerPatientFetch(){
    this.router.navigate(['/register-patient']);

  }
}
