import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Doctor } from '../models/doctor';
import { DoctorService } from '../services/doctor.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="row">
      <h2>Doctors</h2>
      <button class="btn btn-primary" (click)="startAdd()">+ Add Doctor</button>
    </div>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (showForm()) {
      <form class="form-box" [formGroup]="form" (ngSubmit)="save()">
        <h3>{{ editingId() ? 'Edit Doctor' : 'New Doctor' }}</h3>
        <div class="grid">
          <label>Name
            <input formControlName="name" />
          </label>
          <label>Specialization
            <input formControlName="specialization" />
          </label>
          <label>Phone
            <input formControlName="phone" />
          </label>
          <label>Email
            <input formControlName="email" />
          </label>
        </div>
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid">Save</button>
        <button class="btn" type="button" (click)="cancel()">Cancel</button>
      </form>
    }

    <table>
      <thead>
        <tr><th>Name</th><th>Specialization</th><th>Phone</th><th>Email</th><th>Actions</th></tr>
      </thead>
      <tbody>
        @for (d of doctors(); track d.id) {
          <tr>
            <td>{{ d.name }}</td>
            <td>{{ d.specialization }}</td>
            <td>{{ d.phone }}</td>
            <td>{{ d.email }}</td>
            <td>
              <button class="btn btn-edit" (click)="startEdit(d)">Edit</button>
              <button class="btn btn-delete" (click)="delete(d)">Delete</button>
            </td>
          </tr>
        } @empty {
          <tr><td colspan="5">No doctors yet.</td></tr>
        }
      </tbody>
    </table>
  `
})
export class DoctorsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DoctorService);

  doctors = signal<Doctor[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  error = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    specialization: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe({
      next: (data) => this.doctors.set(data),
      error: () => this.error.set('Could not load doctors. Is the backend running?')
    });
  }

  startAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', specialization: '', phone: '', email: '' });
    this.showForm.set(true);
  }

  startEdit(d: Doctor): void {
    this.editingId.set(d.id ?? null);
    this.form.reset({
      name: d.name,
      specialization: d.specialization,
      phone: d.phone,
      email: d.email
    });
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const data: Doctor = {
      name: v.name ?? '',
      specialization: v.specialization ?? '',
      phone: v.phone ?? '',
      email: v.email ?? ''
    };
    const id = this.editingId();
    const request = id ? this.service.update(id, data) : this.service.create(data);
    request.subscribe({
      next: () => {
        this.showForm.set(false);
        this.error.set('');
        this.load();
      },
      error: (e) => this.error.set(e.error?.message ?? 'Save failed. Check the fields.')
    });
  }

  delete(d: Doctor): void {
    if (d.id === undefined || !confirm(`Delete ${d.name}?`)) {
      return;
    }
    this.service.delete(d.id).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(e.error?.message ?? 'Delete failed.')
    });
  }
}
