import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Appointment, AppointmentRequest, AppointmentStatus } from '../models/appointment';
import { Doctor } from '../models/doctor';
import { Patient } from '../models/patient';
import { AppointmentService } from '../services/appointment.service';
import { DoctorService } from '../services/doctor.service';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="row">
      <h2>Appointments</h2>
      <button class="btn btn-primary" (click)="startAdd()">+ Book Appointment</button>
    </div>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (showForm()) {
      <form class="form-box" [formGroup]="form" (ngSubmit)="save()">
        <h3>{{ editingId() ? 'Edit Appointment' : 'New Appointment' }}</h3>
        <div class="grid">
          <label>Patient
            <select formControlName="patientId">
              <option [ngValue]="null" disabled>Select patient</option>
              @for (p of patients(); track p.id) {
                <option [ngValue]="p.id">{{ p.name }}</option>
              }
            </select>
          </label>
          <label>Doctor
            <select formControlName="doctorId">
              <option [ngValue]="null" disabled>Select doctor</option>
              @for (d of doctors(); track d.id) {
                <option [ngValue]="d.id">{{ d.name }} ({{ d.specialization }})</option>
              }
            </select>
          </label>
          <label>Date and time
            <input type="datetime-local" formControlName="appointmentTime" />
          </label>
          <label>Reason
            <input formControlName="reason" />
          </label>
          @if (editingId()) {
            <label>Status
              <select formControlName="status">
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
          }
        </div>
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid">Save</button>
        <button class="btn" type="button" (click)="cancel()">Cancel</button>
      </form>
    }

    <table>
      <thead>
        <tr><th>When</th><th>Patient</th><th>Doctor</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        @for (a of appointments(); track a.id) {
          <tr>
            <td>{{ a.appointmentTime | date: 'medium' }}</td>
            <td>{{ a.patient.name }}</td>
            <td>{{ a.doctor.name }}</td>
            <td>{{ a.reason }}</td>
            <td>{{ a.status }}</td>
            <td>
              <button class="btn btn-edit" (click)="startEdit(a)">Edit</button>
              <button class="btn btn-delete" (click)="delete(a)">Delete</button>
            </td>
          </tr>
        } @empty {
          <tr><td colspan="6">No appointments yet.</td></tr>
        }
      </tbody>
    </table>
  `
})
export class AppointmentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);

  appointments = signal<Appointment[]>([]);
  patients = signal<Patient[]>([]);
  doctors = signal<Doctor[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  error = signal('');

  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    doctorId: [null as number | null, Validators.required],
    appointmentTime: ['', Validators.required],
    reason: [''],
    status: ['SCHEDULED' as AppointmentStatus]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({
      appointments: this.appointmentService.getAll(),
      patients: this.patientService.getAll(),
      doctors: this.doctorService.getAll()
    }).subscribe({
      next: (res) => {
        this.appointments.set(res.appointments);
        this.patients.set(res.patients);
        this.doctors.set(res.doctors);
      },
      error: () => this.error.set('Could not load data. Is the backend running?')
    });
  }

  startAdd(): void {
    this.editingId.set(null);
    this.form.reset({ patientId: null, doctorId: null, appointmentTime: '', reason: '', status: 'SCHEDULED' });
    this.showForm.set(true);
  }

  startEdit(a: Appointment): void {
    this.editingId.set(a.id ?? null);
    this.form.reset({
      patientId: a.patient.id ?? null,
      doctorId: a.doctor.id ?? null,
      // datetime-local expects "YYYY-MM-DDTHH:mm", so trim the seconds
      appointmentTime: a.appointmentTime.substring(0, 16),
      reason: a.reason ?? '',
      status: a.status
    });
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
  }

  save(): void {
    const v = this.form.getRawValue();
    if (this.form.invalid || v.patientId == null || v.doctorId == null) {
      this.form.markAllAsTouched();
      return;
    }
    const body: AppointmentRequest = {
      patientId: v.patientId,
      doctorId: v.doctorId,
      appointmentTime: v.appointmentTime ?? '',
      reason: v.reason ?? '',
      status: v.status ?? 'SCHEDULED'
    };
    const id = this.editingId();
    const request = id ? this.appointmentService.update(id, body) : this.appointmentService.create(body);
    request.subscribe({
      next: () => {
        this.showForm.set(false);
        this.error.set('');
        this.load();
      },
      error: (e) => this.error.set(e.error?.message ?? 'Could not save appointment.')
    });
  }

  delete(a: Appointment): void {
    if (a.id === undefined || !confirm('Delete this appointment?')) {
      return;
    }
    this.appointmentService.delete(a.id).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(e.error?.message ?? 'Delete failed.')
    });
  }
}
