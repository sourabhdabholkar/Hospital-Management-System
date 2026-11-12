# Hospital Management System

Manage **patients**, **doctors** and **appointments**.

| Layer    | Technology                                                   |
|----------|--------------------------------------------------------------|
| Frontend | Angular 17 (standalone components, signals, reactive forms)  |
| Backend  | Java 17, Spring Boot 3, Spring Web (REST API)                |
| Data     | Spring Data JPA, Hibernate, MySQL 8                          |
| DevOps   | Docker, Docker Compose, GitHub                               |

## Features
- Patients: add, edit, delete (CRUD)
- Doctors: add, edit, delete (CRUD); email must be unique
- Appointments: book a patient with a doctor
  - Business rule: a doctor cannot be double-booked at the same time
  - Patients or doctors with appointments cannot be deleted
- Demo data is loaded automatically on first start

## Run with Docker (MySQL + backend)
```bash
docker compose up --build
```
API: http://localhost:8080/api/patients (also /doctors, /appointments)

## Run the frontend
```bash
cd frontend
npm install
npm start
```
Open http://localhost:4200

## REST API
| Resource     | Endpoints                                              |
|--------------|--------------------------------------------------------|
| patients     | GET, GET /{id}, POST, PUT /{id}, DELETE /{id}          |
| doctors      | GET, GET /{id}, POST, PUT /{id}, DELETE /{id}          |
| appointments | GET, GET /{id}, POST, PUT /{id}, DELETE /{id}          |

Example appointment body:
```json
{ "patientId": 1, "doctorId": 2, "appointmentTime": "2026-12-01T10:30:00", "reason": "Fever", "status": "SCHEDULED" }
```

## Deployment
MySQL (Aiven/Railway) → Backend (Render, root folder `backend`) → Frontend (Netlify, root folder `frontend`).
Set these environment variables on the backend: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`.

> Demo project: use fake data only. Real patient data needs strict security and legal compliance.
