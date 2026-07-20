package com.example.vehicle_maintenance.service;

import com.example.vehicle_maintenance.common.response.ApiResponse;
import com.example.vehicle_maintenance.common.response.PageResponse;
import com.example.vehicle_maintenance.service.dto.ServiceRecordRequest;
import com.example.vehicle_maintenance.service.dto.ServiceRecordResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceRecordController {

    private final ServiceRecordService serviceRecordService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ServiceRecordResponse>>> search(
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) java.time.LocalDate from,
            @RequestParam(required = false) java.time.LocalDate to,
            @PageableDefault(size = 20, sort = "serviceDate", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ServiceRecordResponse> result =
                serviceRecordService.search(vehicleId, search, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceRecordResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(serviceRecordService.getById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ServiceRecordResponse>> create(
            @Valid @RequestPart("data") ServiceRecordRequest request,
            @RequestPart(value = "receiptFile", required = false) MultipartFile receiptFile) {
        ServiceRecordResponse response = serviceRecordService.create(request, receiptFile);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service record created", response));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ServiceRecordResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestPart("data") ServiceRecordRequest request,
            @RequestPart(value = "receiptFile", required = false) MultipartFile receiptFile) {
        ServiceRecordResponse response = serviceRecordService.update(id, request, receiptFile);
        return ResponseEntity.ok(ApiResponse.success("Service record updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        serviceRecordService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Service record deleted", null));
    }
}
