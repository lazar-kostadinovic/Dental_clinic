import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
      // alert('Molimo vas da popunite sva polja ispravno.');
      Swal.fire('','Molimo vas da unesete sva polja ispravno','warning')
      return;
    }

    const payload = {
      ...this.registrationModel,
      email: this.registrationModel.email.toLowerCase(),
      brojTelefona: this.registrationModel.brojTelefona.toString(),
    };
    this.http.post('http://localhost:5001/Pacijent/register', payload).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Registracija uspešna!',
          text: 'Da li želite da nastavite na početnu stranicu?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Da, nastavi',
          cancelButtonText: 'Ne, ostani ovde'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/home']);
          }
        });
      },
      error: (error) => {
        Swal.fire({
          title: 'Greška!',
          text: error.error || 'Došlo je do greške tokom registracije.',
          icon: 'error',
          confirmButtonText: 'U redu'
        });
      }      
      });
  }
}
