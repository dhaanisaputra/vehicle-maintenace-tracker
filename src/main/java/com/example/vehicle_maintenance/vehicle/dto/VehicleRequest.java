package com.example.vehicle_maintenance.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VehicleRequest(

        @NotBlank(message = "Vehicle name is required")
        @Size(max = 100, message = "Vehicle name must not exceed 100 characters")
        String vehicleName,

        @Size(max = 20, message = "License plate must not exceed 20 characters")
        String licensePlate
) {
}
