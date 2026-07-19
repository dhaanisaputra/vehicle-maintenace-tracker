package com.example.vehicle_maintenance.vehicle.dto;

import com.example.vehicle_maintenance.vehicle.Vehicle;

import java.time.Instant;
import java.util.UUID;

public record VehicleResponse(
        UUID id,
        String vehicleName,
        String licensePlate,
        Instant createdAt
) {

    public static VehicleResponse from(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getVehicleName(),
                vehicle.getLicensePlate(),
                vehicle.getCreatedAt());
    }
}
