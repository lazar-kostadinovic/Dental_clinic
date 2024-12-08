import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StripeService {

  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number): Promise<{ clientSecret: string }> {
    return firstValueFrom(
      this.http.post<{ clientSecret: string }>(`http://localhost:5001/Stripe/create-payment-intent`, {
        amount: amount,
        currency: 'rsd',
      })
    );
  }
}
