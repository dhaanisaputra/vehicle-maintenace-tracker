package com.example.vehicle_maintenance.vehicle.dto;

import com.example.vehicle_maintenance.vehicle.Vehicle;
import com.example.vehicle_maintenance.vehicle.VehicleType;

import java.time.Instant;
import java.util.UUID;

public record VehicleResponse(
        UUID id,
        String vehicleName,
        VehicleType vehicleType,
        String licensePlate,
        Instant createdAt
) {

    public static VehicleResponse from(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getVehicleName(),
                vehicle.getVehicleType(),
                vehicle.getLicensePlate(),
                vehicle.getCreatedAt());
    }
}
