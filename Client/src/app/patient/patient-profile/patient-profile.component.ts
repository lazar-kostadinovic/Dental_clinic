import { Component, ElementRef, ViewChild, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PacijentDTO } from '../../models/pacijentDTO.model';
import { ScheduleAppointmentComponent } from '../schedule-appointment/schedule-appointment.component';
import { PatientAppointmentsComponent } from '../patient-appointments/patient-appointments.component';
import { Router } from '@angular/router';
import { UpdateProfileComponent } from '../update-profile/update-profile.component';
import { StripeService } from '../../services/stripe.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    PatientAppointmentsComponent,
    ScheduleAppointmentComponent,
    PatientAppointmentsComponent,
    UpdateProfileComponent,
    FormsModule
  ],
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
})
export class PatientProfileComponent {
  patient!: PacijentDTO;
  email: string | null = null;
  showHistory = true;
  showDentists = false;
  showUpdateForm = false;
  isPaymentFormVisible = false;
  isPaymentProcessing =false;
  stripe!: Stripe ;
  card: any = null; 
  cardMounted = false;  
  paymentAmount: number = 0; 

  @ViewChild(PatientAppointmentsComponent)
  patientAppointmentsComponent?: PatientAppointmentsComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private http: HttpClient, private router: Router, private stripeService: StripeService) {}
  ngOnInit() {
    this.email = localStorage.getItem('email');
    console.log(this.email);
    this.fetchPatientProfile();
  }

  ngAfterViewInit() {
    loadStripe('pk_test_51QTXIkG3cGPJ8wzKPtQCYQ5GT5MShiYx6YSxgKz2TWJ5MSWEXfeMlXcBUFvjnGjx73ct443JR2Q9hPOmCuNdlMVt00IuWYFTZW').then(
      (stripe) => {
        if (!stripe) {
          alert('Stripe nije učitan.');
          return;
        }
        this.stripe = stripe;
      }
    );
  }

  handlePayment() {
    this.isPaymentFormVisible = true;
    this.isPaymentProcessing = false;
    this.loadStripeCardElement();
  }

  loadStripeCardElement() {
    if (!this.stripe || this.cardMounted) {
      return;
    }

    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');
    this.cardMounted = true;
  }

  payNow() {
    if (!this.stripe || !this.card || this.paymentAmount <= 0) {
      alert('Molimo vas unesite validan iznos.');
      return;
    }

    this.isPaymentProcessing = true;

    this.stripeService.createPaymentIntent(this.paymentAmount).then(
      (response: { clientSecret: string }) => {
        this.stripe.confirmCardPayment(response.clientSecret, {
          payment_method: {
            card: this.card,
            billing_details: {
              name: `${this.patient.ime} ${this.patient.prezime}`,
            },
          },
        }).then((result) => {
          this.isPaymentProcessing = false;

          if (result.error) {
            alert(`Došlo je do greške: ${result.error.message}`);
          } else if (result.paymentIntent?.status === 'succeeded') {
            alert('Plaćanje uspešno izvršeno!');
            this.reducePatientDebt(this.patient.id, this.paymentAmount);
          }
        });
      }
    ).catch((err) => {
      console.error('Greška prilikom kreiranja Payment Intenta:', err);
      alert('Došlo je do greške prilikom plaćanja.');
      this.isPaymentProcessing = false;
    });
  }

  reducePatientDebt(patientId: string, amount: number) {
    this.http.put(`http://localhost:5001/Pacijent/reduceDebt/${patientId}/${amount}`, {}).subscribe({
      next: (response: any) => {
        this.patient.dugovanje -= amount;
        console.log("proba"); 
        alert(response.message);
      },
      error: (err) => {
        console.error('Greška prilikom smanjenja dugovanja:', err);
        alert('Došlo je do greške prilikom ažuriranja dugovanja.');
      }
    });
  }

  onAppointmentsUpdated(updatedIds: string[]) {
    this.patient.istorijaPregleda = updatedIds;
    console.log('Azurirana lista Id-ova', this.patient.istorijaPregleda);
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

  toggleHistory() {
    this.showHistory = !this.showHistory;
    this.showDentists = false;
    this.showUpdateForm = false;
  }
  toggleDentists() {
    this.showDentists = !this.showDentists;
    this.showHistory = false;
    this.showUpdateForm = false;
  }
  toggleUpdateForm() {
    this.showUpdateForm = !this.showUpdateForm;
    this.showHistory = false;
    this.showDentists = false;
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

  refreshPregledList() {
    this.patientAppointmentsComponent?.fetchPatientHistory();
    this.ngOnInit();
  }

  deleteAccount() {
    const confirmation = window.confirm(
      'Da li ste sigurni da zelite da obriste svoj profil?'
    );
    if (!confirmation) {
      return;
    }

    this.http
      .delete(`http://localhost:5001/Pacijent/${this.patient.id}`)
      .subscribe({
        next: () => {
          alert('obrisan profil');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Greska prilikom birsanja profila:', error);
        },
      });
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
  }
}
