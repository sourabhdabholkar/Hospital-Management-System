package com.example.hms.config;

import com.example.hms.model.Doctor;
import com.example.hms.model.Patient;
import com.example.hms.repository.DoctorRepository;
import com.example.hms.repository.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Adds demo data on first start so the app isn't empty. Runs only when there are no doctors yet.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final DoctorRepository doctors;
    private final PatientRepository patients;

    public DataSeeder(DoctorRepository doctors, PatientRepository patients) {
        this.doctors = doctors;
        this.patients = patients;
    }

    @Override
    public void run(String... args) {
        if (doctors.count() > 0) {
            return;
        }
        doctors.save(doctor("Dr. Asha Mehta", "Cardiology", "9800000001", "asha@hospital.demo"));
        doctors.save(doctor("Dr. Rahul Verma", "Orthopedics", "9800000002", "rahul@hospital.demo"));
        doctors.save(doctor("Dr. Priya Nair", "Pediatrics", "9800000003", "priya@hospital.demo"));

        patients.save(patient("Ravi Kumar", 45, "Male", "9811111111", "Vile Parle, Mumbai"));
        patients.save(patient("Sneha Patil", 29, "Female", "9822222222", "Andheri, Mumbai"));
    }

    private Doctor doctor(String name, String specialization, String phone, String email) {
        Doctor d = new Doctor();
        d.setName(name);
        d.setSpecialization(specialization);
        d.setPhone(phone);
        d.setEmail(email);
        return d;
    }

    private Patient patient(String name, int age, String gender, String phone, String address) {
        Patient p = new Patient();
        p.setName(name);
        p.setAge(age);
        p.setGender(gender);
        p.setPhone(phone);
        p.setAddress(address);
        return p;
    }
}
