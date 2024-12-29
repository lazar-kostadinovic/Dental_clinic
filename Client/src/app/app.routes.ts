import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component'; 
import { PatientProfileComponent } from './patient/patient-profile/patient-profile.component';
import { RegisterDentistComponent } from './register-dentist/register-dentist.component';
import { RegisterPatientComponent } from './register-patient/register-patient.component';
import { DentistProfileComponent } from './dentist/dentist-profile/dentist-profile.component';
import { AdminProfileComponent } from './admin/admin-profile/admin-profile.component';
import { DentistsManagementComponentComponent } from './admin/dentists-management-component/dentists-management-component.component';
import { PatientsManagementComponentComponent } from './admin/patients-management-component/patients-management-component.component';
import { InterventionsManagementComponentComponent } from './admin/interventions-management-component/interventions-management-component.component';
import { ContactComponent } from './contact/contact.component';
import { ScheduleAppointmentComponent } from './patient/schedule-appointment/schedule-appointment.component';
import { DentistScheduleComponent } from './dentist/dentist-profile/dentist-schedule/dentist-schedule.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'contact', component: ContactComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register-dentist', component: RegisterDentistComponent },
  { path: 'register-patient', component: RegisterPatientComponent},
  { path: 'patient-profile', component: PatientProfileComponent },
  { path: 'dentist-profile', component: DentistProfileComponent },
  { path: 'dentist-schedule', component: DentistScheduleComponent },
  { path: 'patient-schedule', component: ScheduleAppointmentComponent },
  { path: 'admin-profile', component: AdminProfileComponent},
  { path: 'dentist-management', component: DentistsManagementComponentComponent},
  { path: 'patient-management', component: PatientsManagementComponentComponent},
  { path: 'interventions-management', component: InterventionsManagementComponentComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
