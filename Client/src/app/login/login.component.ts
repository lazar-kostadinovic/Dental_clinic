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
      .post<any>('http://localhost:5001/api/AuthPacijent', this.loginModel)
      .subscribe(
        (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', this.loginModel.email);
          localStorage.setItem('role', "pacijent");
          this.router.navigate(['/patient-profile']);
        },
        (error) => {
          if (error.status === 401 || error.status === 500) {
            this.tryLoginAsAdmin();
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
   
          if(this.loginModel.email=='admin@gmail.com'){
            this.router.navigate(['/dentist-management']);
          }
          else{
            this.router.navigate(['/dentist-profile']);
          }
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
          localStorage.setItem('role', "admin");
   
          if(this.loginModel.email=='admin@gmail.com'){
            this.router.navigate(['/dentist-management']);
          }
          else if(this.loginModel.email=='adminn@gmail.com'){
            this.router.navigate(['/dentist-management']);
          }
          else{
            this.router.navigate(['/dentist-profile']);
          }
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
