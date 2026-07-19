package com.example.vehicle_maintenance.vehicle;

import com.example.vehicle_maintenance.common.response.ApiResponse;
import com.example.vehicle_maintenance.vehicle.dto.VehicleRequest;
import com.example.vehicle_maintenance.vehicle.dto.VehicleResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> create(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle created", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> update(@PathVariable UUID id,
                                                               @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated", vehicleService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        vehicleService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted", null));
    }
}
