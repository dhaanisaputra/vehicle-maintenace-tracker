package com.example.vehicle_maintenance.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ServiceRecordRequest(

        @NotNull(message = "Vehicle id is required")
        UUID vehicleId,

        @NotNull(message = "Service date is required")
        @PastOrPresent(message = "Service date cannot be in the future")
        LocalDate serviceDate,

        @NotNull(message = "Odometer is required")
        @PositiveOrZero(message = "Odometer must be zero or positive")
        Integer odometer,

        @Size(max = 1000, message = "Parts replaced must not exceed 1000 characters")
        String partsReplaced,

        @NotNull(message = "Total cost is required")
        @PositiveOrZero(message = "Total cost must be zero or positive")
        BigDecimal totalCost,

        @Size(max = 2000, message = "Notes must not exceed 2000 characters")
        String notes
) {
}
