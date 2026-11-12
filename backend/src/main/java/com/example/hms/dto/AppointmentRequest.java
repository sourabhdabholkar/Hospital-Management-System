package com.example.hms.dto;

import com.example.hms.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * DTO (Data Transfer Object): the shape of the JSON the client sends.
 * The client sends patientId and doctorId, not whole objects.
 */
public record AppointmentRequest(
        @NotNull(message = "Patient is required") Long patientId,
        @NotNull(message = "Doctor is required") Long doctorId,
        @NotNull(message = "Date and time are required") LocalDateTime appointmentTime,
        @Size(max = 255) String reason,
        AppointmentStatus status
) {}
