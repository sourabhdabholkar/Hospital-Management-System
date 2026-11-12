import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="topbar">
      <h1>Hospital Management System</h1>
      <nav>
        <a routerLink="/patients" routerLinkActive="active">Patients</a>
        <a routerLink="/doctors" routerLinkActive="active">Doctors</a>
        <a routerLink="/appointments" routerLinkActive="active">Appointments</a>
      </nav>
    </header>
    <main class="container">
      <router-outlet />
    </main>
  `
})
export class AppComponent {}
