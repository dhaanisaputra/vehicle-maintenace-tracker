package com.example.vehicle_maintenance.vehicle.dto;

import com.example.vehicle_maintenance.vehicle.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VehicleRequest(

        @NotBlank(message = "Vehicle name is required")
        @Size(max = 100, message = "Vehicle name must not exceed 100 characters")
        String vehicleName,

        @NotNull(message = "Vehicle type is required")
        VehicleType vehicleType,

        @NotBlank(message = "License plate is required")
        @Size(max = 20, message = "License plate must not exceed 20 characters")
        String licensePlate
) {
}
