import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { PatientProfileComponent } from './patient/patient-profile/patient-profile.component';
import { RegisterDentistComponent } from './register-dentist/register-dentist.component';
import { RegisterPatientComponent } from './register-patient/register-patient.component';
import { DentistProfileComponent } from './dentist/dentist-profile/dentist-profile.component';
import { DentistsManagementComponentComponent } from './admin/dentists-management-component/dentists-management-component.component';
import { PatientsManagementComponentComponent } from './admin/patients-management-component/patients-management-component.component';
import { InterventionsManagementComponentComponent } from './admin/interventions-management-component/interventions-management-component.component';
import { ContactComponent } from './contact/contact.component';
import { ScheduleAppointmentComponent } from './patient/schedule-appointment/schedule-appointment.component';
import { DentistScheduleComponent } from './dentist/dentist-schedule/dentist-schedule.component';
import { ShowDentistComponent } from './show-dentist/show-dentist.component';
import { PatientAppointmentsComponent } from './patient/patient-appointments/patient-appointments.component';
import { DentistAppointmentComponent } from './dentist/dentist-appointment/dentist-appointment.component';
import { UnconfirmedAppointmentsDentistComponent } from './dentist/unconfirmed-appointments-dentist/unconfirmed-appointments-dentist.component';
import { UnconfirmedAppointmentsComponent } from './patient/unconfirmed-appointments/unconfirmed-appointments.component';
import { DaysOffComponent } from './dentist/days-off/days-off.component';
import { AdminGuard } from './admin.guard';
import { DentistGuard } from './dentist.guard';
import { PatientGuard } from './patient.guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'show-dentist', component: ShowDentistComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register-dentist', component: RegisterDentistComponent },
  { path: 'register-patient', component: RegisterPatientComponent },
  {
    path: 'patient-profile',
    component: PatientProfileComponent,
    canActivate: [PatientGuard],
    children: [
      {
        path: 'appointments',
        component: PatientAppointmentsComponent,
        canActivate: [PatientGuard],
      },
      {
        path: 'unconfirmed-appointments',
        component: UnconfirmedAppointmentsComponent,
        canActivate: [PatientGuard],
      },
      {
        path: 'schedule-appointment',
        component: ScheduleAppointmentComponent,
        canActivate: [PatientGuard],
      },
    ],
  },
  { path: 'patient-schedule', component: ScheduleAppointmentComponent },
  {
    path: 'dentist-profile',
    component: DentistProfileComponent,
    canActivate: [DentistGuard],
    children: [
      {
        path: 'appointments',
        component: DentistAppointmentComponent,
        canActivate: [DentistGuard],
      },
      {
        path: 'unconfirmed-appointments',
        component: UnconfirmedAppointmentsDentistComponent,
        canActivate: [DentistGuard],
      },
      {
        path: 'schedule-appointment',
        component: DentistScheduleComponent,
        canActivate: [DentistGuard],
      },
      {
        path: 'days-off',
        component: DaysOffComponent,
        canActivate: [DentistGuard],
      },
    ],
  },
  {
    path: 'dentist-management',
    component: DentistsManagementComponentComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'patient-management',
    component: PatientsManagementComponentComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'interventions-management',
    component: InterventionsManagementComponentComponent,
    canActivate: [AdminGuard],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
