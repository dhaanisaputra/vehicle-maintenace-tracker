package com.example.vehicle_maintenance.vehicle;

import com.example.vehicle_maintenance.common.exception.ResourceNotFoundException;
import com.example.vehicle_maintenance.security.CurrentUserProvider;
import com.example.vehicle_maintenance.user.User;
import com.example.vehicle_maintenance.user.UserRepository;
import com.example.vehicle_maintenance.vehicle.dto.VehicleRequest;
import com.example.vehicle_maintenance.vehicle.dto.VehicleResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAll() {
        UUID userId = currentUserProvider.getCurrentUserId();
        return vehicleRepository.findByUserId(userId).stream()
                .map(VehicleResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public VehicleResponse getById(UUID id) {
        return VehicleResponse.from(getOwnedVehicle(id));
    }

    @Transactional
    public VehicleResponse create(VehicleRequest request) {
        UUID userId = currentUserProvider.getCurrentUserId();
        User user = userRepository.getReferenceById(userId);

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .vehicleName(request.vehicleName())
                .vehicleType(request.vehicleType())
                .licensePlate(request.licensePlate())
                .build();
        Vehicle saved = vehicleRepository.saveAndFlush(vehicle);
        Vehicle persisted = vehicleRepository.findById(saved.getId()).orElse(saved);

        log.info("Vehicle created: id={}, user={}", persisted.getId(), userId);
        return VehicleResponse.from(persisted);
    }

    @Transactional
    public VehicleResponse update(UUID id, VehicleRequest request) {
        Vehicle vehicle = getOwnedVehicle(id);
        vehicle.setVehicleName(request.vehicleName());
        vehicle.setVehicleType(request.vehicleType());
        vehicle.setLicensePlate(request.licensePlate());

        log.info("Vehicle updated: id={}", id);
        return VehicleResponse.from(vehicle);
    }

    @Transactional
    public void delete(UUID id) {
        Vehicle vehicle = getOwnedVehicle(id);
        vehicleRepository.delete(vehicle);
        log.info("Vehicle deleted: id={}", id);
    }

    @Transactional(readOnly = true)
    public Vehicle getOwnedVehicle(UUID id) {
        UUID userId = currentUserProvider.getCurrentUserId();
        return vehicleRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", id));
    }
}
