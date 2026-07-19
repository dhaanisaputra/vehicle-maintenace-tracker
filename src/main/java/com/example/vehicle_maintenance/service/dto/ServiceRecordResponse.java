package com.example.vehicle_maintenance.service.dto;

import com.example.vehicle_maintenance.service.ServiceRecord;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ServiceRecordResponse(
        UUID id,
        UUID vehicleId,
        String vehicleName,
        LocalDate serviceDate,
        Integer odometer,
        String partsReplaced,
        BigDecimal totalCost,
        String receiptImageUrl,
        String notes,
        Instant createdAt
) {

    public static ServiceRecordResponse from(ServiceRecord record) {
        return new ServiceRecordResponse(
                record.getId(),
                record.getVehicle().getId(),
                record.getVehicle().getVehicleName(),
                record.getServiceDate(),
                record.getOdometer(),
                record.getPartsReplaced(),
                record.getTotalCost(),
                record.getReceiptImageUrl(),
                record.getNotes(),
                record.getCreatedAt());
    }
}
