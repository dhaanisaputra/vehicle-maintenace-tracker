package com.example.vehicle_maintenance.service;

import com.example.vehicle_maintenance.common.exception.ResourceNotFoundException;
import com.example.vehicle_maintenance.common.response.PageResponse;
import com.example.vehicle_maintenance.file.FileStorageService;
import com.example.vehicle_maintenance.security.CurrentUserProvider;
import com.example.vehicle_maintenance.service.dto.ServiceRecordRequest;
import com.example.vehicle_maintenance.service.dto.ServiceRecordResponse;
import com.example.vehicle_maintenance.vehicle.Vehicle;
import com.example.vehicle_maintenance.vehicle.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceRecordService {

    private final ServiceRecordRepository serviceRecordRepository;
    private final VehicleService vehicleService;
    private final FileStorageService fileStorageService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public PageResponse<ServiceRecordResponse> search(UUID vehicleId, String keyword, Pageable pageable) {
        UUID userId = currentUserProvider.getCurrentUserId();

        Specification<ServiceRecord> spec = Specification.allOf(
                ServiceRecordSpecifications.ownedBy(userId),
                ServiceRecordSpecifications.hasVehicle(vehicleId),
                ServiceRecordSpecifications.matchesKeyword(keyword));

        Page<ServiceRecord> page = serviceRecordRepository.findAll(spec, pageable);
        return PageResponse.from(page, ServiceRecordResponse::from);
    }

    @Transactional(readOnly = true)
    public ServiceRecordResponse getById(UUID id) {
        return ServiceRecordResponse.from(getOwnedRecord(id));
    }

    @Transactional
    public ServiceRecordResponse create(ServiceRecordRequest request, MultipartFile receiptFile) {
        Vehicle vehicle = vehicleService.getOwnedVehicle(request.vehicleId());

        ServiceRecord record = ServiceRecord.builder()
                .vehicle(vehicle)
                .serviceDate(request.serviceDate())
                .odometer(request.odometer())
                .partsReplaced(request.partsReplaced())
                .totalCost(request.totalCost())
                .notes(request.notes())
                .receiptImageUrl(storeReceiptIfPresent(receiptFile))
                .build();

        ServiceRecord saved = serviceRecordRepository.save(record);
        log.info("Service record created: id={}, vehicle={}", saved.getId(), vehicle.getId());
        return ServiceRecordResponse.from(saved);
    }

    @Transactional
    public ServiceRecordResponse update(UUID id, ServiceRecordRequest request, MultipartFile receiptFile) {
        ServiceRecord record = getOwnedRecord(id);
        Vehicle vehicle = vehicleService.getOwnedVehicle(request.vehicleId());

        record.setVehicle(vehicle);
        record.setServiceDate(request.serviceDate());
        record.setOdometer(request.odometer());
        record.setPartsReplaced(request.partsReplaced());
        record.setTotalCost(request.totalCost());
        record.setNotes(request.notes());

        if (receiptFile != null && !receiptFile.isEmpty()) {
            String oldUrl = record.getReceiptImageUrl();
            record.setReceiptImageUrl(fileStorageService.store(receiptFile));
            fileStorageService.delete(oldUrl);
        }

        log.info("Service record updated: id={}", id);
        return ServiceRecordResponse.from(record);
    }

    @Transactional
    public void delete(UUID id) {
        ServiceRecord record = getOwnedRecord(id);
        String receiptUrl = record.getReceiptImageUrl();
        serviceRecordRepository.delete(record);
        fileStorageService.delete(receiptUrl);
        log.info("Service record deleted: id={}", id);
    }

    private ServiceRecord getOwnedRecord(UUID id) {
        UUID userId = currentUserProvider.getCurrentUserId();
        return serviceRecordRepository.findByIdAndVehicleUserId(id, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Service record", id));
    }

    private String storeReceiptIfPresent(MultipartFile receiptFile) {
        if (receiptFile != null && !receiptFile.isEmpty()) {
            return fileStorageService.store(receiptFile);
        }
        return null;
    }
}
