package com.example.hms.repository;

import com.example.hms.model.Appointment;
import com.example.hms.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

/**
 * Spring Data reads the method names and writes the query for us.
 * e.g. existsByDoctorIdAndAppointmentTime... means: WHERE doctor_id = ? AND appointment_time = ? ...
 */
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByPatientId(Long patientId);

    boolean existsByDoctorId(Long doctorId);

    boolean existsByDoctorIdAndAppointmentTimeAndStatus(Long doctorId, LocalDateTime time, AppointmentStatus status);

    boolean existsByDoctorIdAndAppointmentTimeAndStatusAndIdNot(Long doctorId, LocalDateTime time,
                                                                AppointmentStatus status, Long id);
}
