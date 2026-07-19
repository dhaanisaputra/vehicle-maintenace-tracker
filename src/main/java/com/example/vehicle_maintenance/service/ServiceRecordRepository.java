package com.example.vehicle_maintenance.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ServiceRecordRepository
        extends JpaRepository<ServiceRecord, UUID>, JpaSpecificationExecutor<ServiceRecord> {

    Optional<ServiceRecord> findByIdAndVehicleUserId(UUID id, UUID userId);
}
