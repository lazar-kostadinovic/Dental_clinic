import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component'; 
import { PatientProfileComponent } from './patient/patient-profile/patient-profile.component';
import { RegisterDentistComponent } from './register-dentist/register-dentist.component';
import { RegisterPatientComponent } from './register-patient/register-patient.component';
import { DentistProfileComponent } from './dentist/dentist-profile/dentist-profile.component';
import { AdminProfileComponent } from './admin/admin-profile/admin-profile.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register-dentist', component: RegisterDentistComponent },
  { path: 'register-patient', component: RegisterPatientComponent},
  { path: 'patient-profile', component: PatientProfileComponent },
  { path: 'dentist-profile', component: DentistProfileComponent },
  { path: 'admin-profile', component: AdminProfileComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
