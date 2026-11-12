import { Doctor } from './doctor';
import { Patient } from './patient';

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

// What the API returns (includes full patient and doctor)
export interface Appointment {
  id?: number;
  patient: Patient;
  doctor: Doctor;
  appointmentTime: string;
  reason?: string;
  status: AppointmentStatus;
}

// What we send to the API (only ids)
export interface AppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentTime: string;
  reason?: string;
  status?: AppointmentStatus;
}
