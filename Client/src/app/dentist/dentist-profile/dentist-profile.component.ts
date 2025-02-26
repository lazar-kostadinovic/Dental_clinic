import { Component, ElementRef, ViewChild } from '@angular/core';
import { StomatologDTO } from '../../models/stomatologDTO.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-dentist-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  templateUrl: './dentist-profile.component.html',
  styleUrls: ['./dentist-profile.component.css'],
})
export class DentistProfileComponent {
  dentist!: StomatologDTO;
  email: string | null = null;
  showAppointments = true;
  showDayOffForm = false;
  showAppointmentForm = false;
  showUnconfirmedAppointments = false;

  availableTimeSlots: string[] = [];
  selectedDate: string | null = null;
  selectedPatient: string | null = null;
  newAppointment = {
    datum: '',
    vreme: '',
    opis: '',
  };

  isEditing = {
    email: false,
    brojTelefona: false,
    adresa: false,
  };

  updatedValues = {
    email: '',
    brojTelefona: '',
    adresa: '',
  };

  token = localStorage.getItem('token');

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.email = localStorage.getItem('email');
    this.fetchDentistProfile();

    const alreadyNavigated = sessionStorage.getItem('alreadyNavigated');

    if (!alreadyNavigated) {
      setTimeout(() => {
        this.router.navigate(['appointments'], {
          relativeTo: this.route,
          queryParams: { dentistId: this.dentist.id },
        });
        sessionStorage.setItem('alreadyNavigated', 'true');
      }, 200);
    }
  }

  // onAppointmentCharged(){
  //   this.fetchDentistProfile();
  // }
  // onAppointmentsUpdated(updatedIds: string[]) {
  //   this.dentist.pregledi = updatedIds;
  // }
  // onApointmentCanceled(): void {
  //   this.showAppointments=true;
  //   this.showAppointmentForm = false;
  //   this.fetchDentistProfile();
  // }
  // onAppointmentScheduled(newAppointmentId: string): void {
  //   this.showAppointmentForm = false;
  //   console.log([newAppointmentId, ...this.dentist.pregledi]);
  //   this.dentist.pregledi = [newAppointmentId, ...this.dentist.pregledi];
  //   this.fetchDentistProfile();
  // }
  // onAppointmentTaken(){
  //   this.fetchDentistProfile();
  // }

  getDentistShift(shift: boolean) {
    return shift === true ? ' prva' : ' druga';
  }

  fetchDentistProfile() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<StomatologDTO>(
        `http://localhost:5001/Stomatolog/GetStomatologByEmail/${this.email}`,
        { headers }
      )
      .subscribe({
        next: (dentistData) => {
          this.dentist = dentistData;
        },
        error: (error) => {
          console.error('Error fetching dentist profile:', error);
        },
      });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.http
        .post(
          `http://localhost:5001/Stomatolog/uploadSlika/${this.dentist.id}`,
          formData
        )
        .subscribe({
          next: (response: any) => {
            //console.log('Image uploaded successfully:', response);
            this.dentist.slika = response.fileName;
          },
          error: (err) => {
            console.error('Error uploading image:', err);
          },
        });
    }
  }

  // toggleAppointmentForm() {
  //   this.showAppointmentForm = true;
  //   this.showAppointments = false;
  //   this.showDayOffForm = false;
  //   this.showUnconfirmedAppointments = false;
  //   this.fetchDentistProfile();
  // }

  // toggleAppointmentsHistory() {
  //   this.showAppointments = true;
  //   this.showAppointmentForm = false;
  //   this.showDayOffForm = false;
  //   this.showUnconfirmedAppointments = false;
  //   this.fetchDentistProfile();
  // }

  // toggleUnconfirmedAppointments() {
  //   this.showUnconfirmedAppointments = true;
  //   this.showAppointments = false;
  //   this.showDayOffForm = false;
  //   this.showAppointmentForm = false;
  //   this.fetchDentistProfile();
  // }

  // toggleDayOffForm() {
  //   this.showAppointments = false;
  //   this.showDayOffForm = true;
  //   this.showAppointmentForm = false;
  //   this.showUnconfirmedAppointments = false;
  //   this.fetchDentistProfile();
  //   this.fetchAllDaysOff();
  // }
  showButtons() {
    if (
      this.showAppointmentForm == false &&
      this.showDayOffForm == false &&
      this.showUnconfirmedAppointments == false
    )
      return true;
    else return false;
  }

  closeForm(): void {
    this.newAppointment = { datum: '', vreme: '', opis: '' };
    this.availableTimeSlots = [];
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:5001/assets/${imageName}`;
  }

  // submitDayOff(): void {
  //   if (!this.selectedDate) {
  //     alert('Molimo odaberite datum.');
  //     return;
  //   }

  //   const token = localStorage.getItem('token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   //console.log(token);

  //   this.http.post(`http://localhost:5001/Stomatolog/addDayOff/${this.dentist.id}/${this.selectedDate}`,null, { headers })
  //     .subscribe({
  //       next: (response: any) => {
  //         //console.log('Slobodan dan uspešno dodat:', response);
  //         alert(`Slobodan dan za ${this.selectedDate} je dodat.`);
  //         this.selectedDate = null;
  //         // this.showDayOffForm = false;
  //         this.fetchAllDaysOff()
  //         this.fetchDentistProfile();
  //       },
  //       error: (err) => {
  //         console.error('Greška prilikom dodavanja slobodnog dana:', err.error);
  //         alert(`Vec ste postavili ovaj dan za slobodan.`);
  //       },
  //     });
  // }


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
          //console.log(this.dentist.prvaSmena);
          this.fetchDentistProfile();
        },
        error: (error) => {
          alert('Greska prilikom menjanja smene');
        },
      });
  }

  toggleEditEmail() {
    this.isEditing.email = !this.isEditing.email;
    // this.isEditing.adresa=false;
    // this.isEditing.brojTelefona=false;
  }
  toggleEditNumber() {
    this.isEditing.brojTelefona = !this.isEditing.brojTelefona;
    // this.isEditing.adresa=false;
    // this.isEditing.email=false;
  }
  toggleEditAddress() {
    this.isEditing.adresa = !this.isEditing.adresa;
    // this.isEditing.email=false;
    // this.isEditing.brojTelefona=false;
  }

  saveChanges(field: string) {
    const apiUrl = `http://localhost:5001/Stomatolog`;
    let endpoint = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    switch (field) {
      case 'email':
        endpoint = `changeEmail/${this.dentist.id}/${this.updatedValues.email}`;
        break;
      case 'brojTelefona':
        endpoint = `changeNumber/${this.dentist.id}/${this.updatedValues.brojTelefona}`;
        break;
      case 'adresa':
        endpoint = `changeAddress/${this.dentist.id}/${this.updatedValues.adresa}`;
        break;
      default:
        console.error('Nepoznat tip izmene:', field);
        return;
    }

    this.http.put(`${apiUrl}/${endpoint}`, {}, { headers }).subscribe({
      next: () => {
        (this.dentist as any)[field] = this.updatedValues[field];
        this.isEditing[field] = false;
        alert(`${field} uspešno ažurirano!`);
        if (field === 'email') {
          localStorage.setItem('email', this.updatedValues.email);
          this.fetchDentistProfile();
        }
      },
      error: (err) => {
        console.error(`Greška pri ažuriranju ${field}:`, err);
        alert(`Došlo je do greške pri ažuriranju ${field}.`);
      },
    });
  }
}
