import {
  AfterContentInit,
  Component,
  ElementRef,
  ViewChild,
  viewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PacijentDTO } from '../../models/pacijentDTO.model';
import { ScheduleAppointmentComponent } from '../schedule-appointment/schedule-appointment.component';
import { PatientAppointmentsComponent } from '../patient-appointments/patient-appointments.component';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { StripeService } from '../../services/stripe.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { StateService } from '../../services/state.service';
import { timeout } from 'rxjs';
import { NavigationStateService } from '../../services/navigation.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
})
export class PatientProfileComponent {
  patient!: PacijentDTO;
  email: string | null = null;
  isPaymentFormVisible = false;
  isPaymentProcessing = false;
  stripe!: Stripe;
  card: any = null;
  cardMounted = false;
  paymentAmount: number = 0;
  count: number = 0;

  isEditing = {
    email: false,
    telefon: false,
    adresa: false,
  };

  updatedValues = {
    email: '',
    telefon: '',
    adresa: '',
  };

  @ViewChild(PatientAppointmentsComponent)
  patientAppointmentsComponent?: PatientAppointmentsComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private http: HttpClient,
    private router: Router,
    private stripeService: StripeService,
    private stateService: StateService,
    private route: ActivatedRoute,
    private navigationState: NavigationStateService
  ) {}

  ngOnInit() {
    this.email = localStorage.getItem('email');
    console.log(this.email);
    this.fetchPatientProfile();
    const alreadyNavigated = sessionStorage.getItem('alreadyNavigated');

    if (!alreadyNavigated) {
      setTimeout(() => {
        this.router.navigate(['appointments'], {
          relativeTo: this.route,
          queryParams: { appointmentIds: this.patient.pregledi },
        });
        sessionStorage.setItem('alreadyNavigated', 'true');
      }, 200);
    }
  }

  ngAfterViewInit() {
    loadStripe(
      'pk_test_51QTXIkG3cGPJ8wzKPtQCYQ5GT5MShiYx6YSxgKz2TWJ5MSWEXfeMlXcBUFvjnGjx73ct443JR2Q9hPOmCuNdlMVt00IuWYFTZW'
    ).then((stripe) => {
      if (!stripe) {
        Swal.fire('Greška', 'Stripe nije učitan.', 'error');
        return;
      }
      this.stripe = stripe;
    });
  }

  closePaymentForm() {
    this.isPaymentFormVisible = false;
    this.card.destroy();
    this.cardMounted = false;
    this.resetHiddenState();
  }

  setHiddenState() {
    this.stateService.setHiddenState(true);
  }
  resetHiddenState() {
    this.stateService.setHiddenState(false);
  }

  handlePayment() {
    this.isPaymentFormVisible = true;
    this.isPaymentProcessing = false;
    this.setHiddenState();
    setTimeout(() => {
      this.loadStripeCardElement();
    }, 300);
  }

  loadStripeCardElement() {
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');
    this.cardMounted = true;
  }

  payNow() {
    if (!this.stripe || !this.card || this.paymentAmount <= 0) {
      Swal.fire('Upozorenje', 'Molimo vas unesite validan iznos.', 'warning');
      return;
    }

    this.isPaymentProcessing = true;

    this.stripeService
      .createPaymentIntent(this.paymentAmount)
      .then((response: { clientSecret: string }) => {
        this.stripe
          .confirmCardPayment(response.clientSecret, {
            payment_method: {
              card: this.card,
              billing_details: {
                name: `${this.patient.ime} ${this.patient.prezime}`,
              },
            },
          })
          .then((result) => {
            this.isPaymentProcessing = false;

            if (result.error) {
              Swal.fire('Greška', ` ${result.error.message}`, 'error');
            } else if (result.paymentIntent?.status === 'succeeded') {
              Swal.fire('', 'Plaćanje uspešno izvršeno!', 'success');
              this.reducePatientDebt(this.patient.id, this.paymentAmount);
              this.paymentAmount = 0;
              this.card.destroy();
              this.cardMounted = false;
              this.isPaymentFormVisible = false;
              this.resetHiddenState();
            }
          });
      })
      .catch((err) => {
        console.error('Greška prilikom kreiranja Payment Intenta:', err);
        Swal.fire('Greška', 'Došlo je do greške prilikom plaćanja.', 'error');
        this.isPaymentProcessing = false;
        this.resetHiddenState();
      });
  }

  reducePatientDebt(patientId: string, amount: number) {
    this.http
      .put(
        `http://localhost:5001/Pacijent/reduceDebt/${patientId}/${amount}`,
        {}
      )
      .subscribe({
        next: (response: any) => {
          this.patient.dugovanje -= amount;
          console.log('proba');
          Swal.fire('', response.message, 'success');
        },
        error: (err) => {
          console.error('Greška prilikom smanjenja dugovanja:', err);
          Swal.fire(
            'Greška',
            'Došlo je do greške prilikom ažuriranja dugovanja.',
            'error'
          );
        },
      });
  }

  onAppointmentsUpdated(updatedIds: string[]) {
    this.patient.pregledi = updatedIds;
    console.log('Azurirana lista Id-ova', this.patient.pregledi);
  }
  fetchPatientProfile() {
    this.http
      .get<PacijentDTO>(
        `http://localhost:5001/Pacijent/GetPacijentByEmail/${this.email}`
      )
      .subscribe({
        next: (patientData) => {
          this.patient = patientData;
        },
        error: (error) => {
          console.error('Error fetching patient profile:', error);
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
          `http://localhost:5001/Pacijent/uploadSlika/${this.patient.id}`,
          formData
        )
        .subscribe({
          next: (response: any) => {
            console.log('Image uploaded successfully:', response);
            this.patient.slika = response.fileName;
          },
          error: (err) => {
            console.error('Error uploading image:', err);
          },
        });
    }
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:5001/assets/${imageName}`;
  }

  // refreshPregledList() {
  //   console.log("ima li ovde");
  //   this.showSchedule=false;
  //   this.patientAppointmentsComponent?.fetchPatientHistory();
  //   this.ngOnInit();
  //   this.toggleSchedule();
  // }

  onAppointmentScheduled(newAppointmentId: string): void {
    this.patient.pregledi = [newAppointmentId, ...this.patient.pregledi];
    this.fetchPatientProfile();
  }

  deleteAccount() {
    Swal.fire({
      title: 'Potvrda',
      text: 'Da li ste sigurni da želite da obrišete svoj profil?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da, obriši',
      cancelButtonText: 'Ne',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .delete(`http://localhost:5001/Pacijent/${this.patient.id}`)
          .subscribe({
            next: () => {
              Swal.fire('', 'Vaš profil je obrisan.', 'success');
              this.router.navigate(['/home']);
            },
            error: (error) => {
              console.error('Greška prilikom brisanja profila:', error);
              Swal.fire(
                'Greška',
                'Došlo je do greške prilikom brisanja profila.',
                'error'
              );
            },
          });
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
      }
    });
  }

  toggleEditEmail() {
    this.isEditing.email = !this.isEditing.email;
    // this.isEditing.adresa = false;
    // this.isEditing.telefon = false;
  }
  toggleEditNumber() {
    this.isEditing.telefon = !this.isEditing.telefon;
    // this.isEditing.adresa = false;
    // this.isEditing.email = false;
  }
  toggleEditAddress() {
    this.isEditing.adresa = !this.isEditing.adresa;
    // this.isEditing.email = false;
    // this.isEditing.telefon = false;
  }

  saveChanges(field: string) {
    const apiUrl = `http://localhost:5001/Pacijent`;
    let endpoint = '';

    switch (field) {
      case 'email':
        endpoint = `changeEmail/${this.patient.id}/${this.updatedValues.email}`;
        break;
      case 'telefon':
        endpoint = `changeNumber/${this.patient.id}/${this.updatedValues.telefon}`;
        break;
      case 'adresa':
        endpoint = `changeAddress/${this.patient.id}/${this.updatedValues.adresa}`;
        break;
      default:
        console.error('Nepoznat tip izmene:', field);
        return;
    }

    this.http.put(`${apiUrl}/${endpoint}`, {}).subscribe({
      next: () => {
        (this.patient as any)[field] = this.updatedValues[field];
        this.isEditing[field] = false;
        Swal.fire('', `${field} uspešno ažuriran!`, 'success');
        if (field === 'email') {
          localStorage.setItem('email', this.updatedValues.email);
        }
        this.fetchPatientProfile();
      },
      error: (err) => {
        console.error(`Greška pri ažuriranju ${field}:`, err);
        alert(`Došlo je do greške pri ažuriranju ${field}.`);
      },
    });
  }
  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    1;
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
