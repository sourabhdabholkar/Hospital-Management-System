import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'patients', pathMatch: 'full' },
  {
    path: 'patients',
    loadComponent: () => import('./patients/patients.component').then((m) => m.PatientsComponent)
  },
  {
    path: 'doctors',
    loadComponent: () => import('./doctors/doctors.component').then((m) => m.DoctorsComponent)
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./appointments/appointments.component').then((m) => m.AppointmentsComponent)
  },
  { path: '**', redirectTo: 'patients' }
];
