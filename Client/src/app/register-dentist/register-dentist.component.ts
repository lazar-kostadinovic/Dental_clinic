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
    { id: 0, name: 'Opsta stomatologija' },
    { id: 1, name: 'Oralna hirugija' },
    { id: 2, name: 'Ortodontija' },
    { id: 3, name: 'Parodontologija' },
    { id: 4, name: 'Endodoncija' },
    { id: 5, name: 'Pedijatrijska stomatologija' },
    { id: 6, name: 'Protetika' },
    { id: 7, name: 'Estetska stomatologija' },
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
      error: (error) => {
          alert(error.error);
      },
    });
  }

  adminProfile() {
    this.router.navigate(['/dentist-management']);
  }
}
