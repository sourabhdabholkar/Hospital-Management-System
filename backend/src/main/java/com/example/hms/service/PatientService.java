package com.example.hms.service;

import com.example.hms.model.Patient;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patients;
    private final AppointmentRepository appointments;

    public PatientService(PatientRepository patients, AppointmentRepository appointments) {
        this.patients = patients;
        this.appointments = appointments;
    }

    @Transactional(readOnly = true)
    public List<Patient> findAll() {
        return patients.findAll();
    }

    @Transactional(readOnly = true)
    public Patient findById(Long id) {
        return patients.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found: " + id));
    }

    public Patient create(Patient patient) {
        return patients.save(patient);
    }

    public Patient update(Long id, Patient data) {
        Patient existing = findById(id);
        existing.setName(data.getName());
        existing.setAge(data.getAge());
        existing.setGender(data.getGender());
        existing.setPhone(data.getPhone());
        existing.setAddress(data.getAddress());
        return existing;
    }

    public void delete(Long id) {
        Patient patient = findById(id);
        if (appointments.existsByPatientId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Patient has appointments and cannot be deleted");
        }
        patients.delete(patient);
    }
}
