package com.example.hms.service;

import com.example.hms.dto.AppointmentRequest;
import com.example.hms.model.Appointment;
import com.example.hms.model.AppointmentStatus;
import com.example.hms.model.Doctor;
import com.example.hms.model.Patient;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.DoctorRepository;
import com.example.hms.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointments;
    private final PatientRepository patients;
    private final DoctorRepository doctors;

    public AppointmentService(AppointmentRepository appointments,
                              PatientRepository patients,
                              DoctorRepository doctors) {
        this.appointments = appointments;
        this.patients = patients;
        this.doctors = doctors;
    }

    @Transactional(readOnly = true)
    public List<Appointment> findAll() {
        return appointments.findAll();
    }

    @Transactional(readOnly = true)
    public Appointment findById(Long id) {
        return appointments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found: " + id));
    }

    public Appointment create(AppointmentRequest request) {
        Appointment appointment = new Appointment();
        apply(appointment, request);
        ensureSlotFree(appointment, null);
        return appointments.save(appointment);
    }

    public Appointment update(Long id, AppointmentRequest request) {
        Appointment appointment = findById(id);
        apply(appointment, request);
        ensureSlotFree(appointment, id);
        return appointment;
    }

    public void delete(Long id) {
        appointments.delete(findById(id));
    }

    /** Copies the request values onto the entity, loading the real Patient and Doctor. */
    private void apply(Appointment appointment, AppointmentRequest request) {
        Patient patient = patients.findById(request.patientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Patient not found: " + request.patientId()));
        Doctor doctor = doctors.findById(request.doctorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Doctor not found: " + request.doctorId()));

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(request.appointmentTime());
        appointment.setReason(request.reason());
        appointment.setStatus(request.status() != null ? request.status() : AppointmentStatus.SCHEDULED);
    }

    /** Business rule: a doctor cannot have two active appointments at the same time. */
    private void ensureSlotFree(Appointment appointment, Long currentId) {
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            return;
        }
        Long doctorId = appointment.getDoctor().getId();
        boolean busy = (currentId == null)
                ? appointments.existsByDoctorIdAndAppointmentTimeAndStatus(
                        doctorId, appointment.getAppointmentTime(), AppointmentStatus.SCHEDULED)
                : appointments.existsByDoctorIdAndAppointmentTimeAndStatusAndIdNot(
                        doctorId, appointment.getAppointmentTime(), AppointmentStatus.SCHEDULED, currentId);
        if (busy) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This doctor already has an appointment at that time");
        }
    }
}
