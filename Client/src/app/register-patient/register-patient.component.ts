import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-patient',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register-patient.component.html',
  styleUrl: './register-patient.component.css',
})
export class RegisterPatientComponent {
  registrationModel = {
    ime: '',
    prezime: '',
    datumRodjenja: '',
    adresa: '',
    brojTelefona: '',
    email: '',
    password: '',
  };

  constructor(private http: HttpClient, private router: Router) {}

  onRegister(form: NgForm) {
    if (form.invalid) {
      alert('Molimo vas da popunite sva polja ispravno.');
      return;
    }

    const payload = {
      ...this.registrationModel,
      email: this.registrationModel.email.toLowerCase(),
      brojTelefona: this.registrationModel.brojTelefona.toString(),
    };
    this.http.post('http://localhost:5001/Pacijent/register', payload).subscribe({
        next: (response) => {
          const userConfirmed = window.confirm('Registration successful');
          if (userConfirmed) {
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          alert(error.error);
      },
      });
  }
}
