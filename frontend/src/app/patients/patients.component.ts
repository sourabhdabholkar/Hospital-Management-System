import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Patient } from '../models/patient';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="row">
      <h2>Patients</h2>
      <button class="btn btn-primary" (click)="startAdd()">+ Add Patient</button>
    </div>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (showForm()) {
      <form class="form-box" [formGroup]="form" (ngSubmit)="save()">
        <h3>{{ editingId() ? 'Edit Patient' : 'New Patient' }}</h3>
        <div class="grid">
          <label>Full name
            <input formControlName="name" />
          </label>
          <label>Age
            <input type="number" formControlName="age" />
          </label>
          <label>Gender
            <select formControlName="gender">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>Phone
            <input formControlName="phone" />
          </label>
          <label>Address
            <input formControlName="address" />
          </label>
        </div>
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid">Save</button>
        <button class="btn" type="button" (click)="cancel()">Cancel</button>
      </form>
    }

    <table>
      <thead>
        <tr><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Address</th><th>Actions</th></tr>
      </thead>
      <tbody>
        @for (p of patients(); track p.id) {
          <tr>
            <td>{{ p.name }}</td>
            <td>{{ p.age }}</td>
            <td>{{ p.gender }}</td>
            <td>{{ p.phone }}</td>
            <td>{{ p.address }}</td>
            <td>
              <button class="btn btn-edit" (click)="startEdit(p)">Edit</button>
              <button class="btn btn-delete" (click)="delete(p)">Delete</button>
            </td>
          </tr>
        } @empty {
          <tr><td colspan="6">No patients yet.</td></tr>
        }
      </tbody>
    </table>
  `
})
export class PatientsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PatientService);

  patients = signal<Patient[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  error = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    age: [null as number | null, [Validators.required, Validators.min(0), Validators.max(150)]],
    gender: ['Male', Validators.required],
    phone: ['', Validators.required],
    address: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe({
      next: (data) => this.patients.set(data),
      error: () => this.error.set('Could not load patients. Is the backend running?')
    });
  }

  startAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', age: null, gender: 'Male', phone: '', address: '' });
    this.showForm.set(true);
  }

  startEdit(p: Patient): void {
    this.editingId.set(p.id ?? null);
    this.form.reset({
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      address: p.address ?? ''
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
    const data: Patient = {
      name: v.name ?? '',
      age: v.age ?? 0,
      gender: v.gender ?? '',
      phone: v.phone ?? '',
      address: v.address ?? ''
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

  delete(p: Patient): void {
    if (p.id === undefined || !confirm(`Delete ${p.name}?`)) {
      return;
    }
    this.service.delete(p.id).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(e.error?.message ?? 'Delete failed.')
    });
  }
}
