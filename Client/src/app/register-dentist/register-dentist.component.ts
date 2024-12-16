import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-dentist',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register-dentist.component.html',
  styleUrl: './register-dentist.component.css',
})
export class RegisterDentistComponent {
  registrationModel = {
    ime: '',
    prezime: '',
    slika: 'default.jpg',
    adresa: '',
    brojTelefona: '',
    specijalizacija: 0,
    email: '',
    password: '',
  };

  specializations = [
    { id: 0, name: 'Oralni hirurg' },
    { id: 1, name: 'Ortodontija' },
    { id: 2, name: 'Parodontologija' },
    { id: 3, name: 'Endodoncija' },
    { id: 4, name: 'Pedijatrijska stomatologija' },
    { id: 5, name: 'Protetika' },
    { id: 6, name: 'Estetska stomatologija' },
    { id: 7, name: 'Oralna medicina' },
  ];

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
      specijalizacija: Number(this.registrationModel.specijalizacija),
    };
  
    this.http.post('http://localhost:5001/Stomatolog/register', payload).subscribe({
      next: (response) => {
        const userConfirmed = window.confirm('Registration successful');
        if (userConfirmed) {
          this.adminProfile();
        }
      },
      error: (error) =>
        alert('Stomatolog sa ovom email adresom vec postoji'),
        // alert(`Registration failed: ${error.error.ErrorMessage}`),
    });
  }
  
  adminProfile() {
    this.router.navigate(['/admin-profile']);
  }
}
