package com.example.vehicle_maintenance.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findByUserId(UUID userId);

    Optional<Vehicle> findByIdAndUserId(UUID id, UUID userId);
}
