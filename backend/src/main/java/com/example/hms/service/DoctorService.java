package com.example.hms.service;

import com.example.hms.model.Doctor;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.DoctorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class DoctorService {

    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;

    public DoctorService(DoctorRepository doctors, AppointmentRepository appointments) {
        this.doctors = doctors;
        this.appointments = appointments;
    }

    @Transactional(readOnly = true)
    public List<Doctor> findAll() {
        return doctors.findAll();
    }

    @Transactional(readOnly = true)
    public Doctor findById(Long id) {
        return doctors.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found: " + id));
    }

    public Doctor create(Doctor doctor) {
        ensureEmailAvailable(doctor.getEmail(), null);
        return doctors.save(doctor);
    }

    public Doctor update(Long id, Doctor data) {
        Doctor existing = findById(id);
        ensureEmailAvailable(data.getEmail(), id);
        existing.setName(data.getName());
        existing.setSpecialization(data.getSpecialization());
        existing.setPhone(data.getPhone());
        existing.setEmail(data.getEmail());
        return existing;
    }

    public void delete(Long id) {
        Doctor doctor = findById(id);
        if (appointments.existsByDoctorId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Doctor has appointments and cannot be deleted");
        }
        doctors.delete(doctor);
    }

    private void ensureEmailAvailable(String email, Long currentId) {
        doctors.findByEmailIgnoreCase(email).ifPresent(other -> {
            if (!other.getId().equals(currentId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
        });
    }
}
