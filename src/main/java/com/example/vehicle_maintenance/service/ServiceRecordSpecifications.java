package com.example.vehicle_maintenance.service;

import com.example.vehicle_maintenance.vehicle.Vehicle;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.UUID;

public final class ServiceRecordSpecifications {

    private ServiceRecordSpecifications() {
    }

    public static Specification<ServiceRecord> ownedBy(UUID userId) {
        return (root, query, cb) -> {
            var vehicle = root.get("vehicle");
            return cb.equal(vehicle.get("user").get("id"), userId);
        };
    }

    public static Specification<ServiceRecord> hasVehicle(UUID vehicleId) {
        if (vehicleId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("vehicle").get("id"), vehicleId);
    }

    public static Specification<ServiceRecord> matchesKeyword(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        String pattern = "%" + keyword.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("partsReplaced")), pattern),
                cb.like(cb.lower(root.get("notes")), pattern));
    }

    public static Specification<ServiceRecord> serviceDateBetween(java.time.LocalDate from, java.time.LocalDate to) {
        if (from == null && to == null) {
            return null;
        }
        return (root, query, cb) -> {
            jakarta.persistence.criteria.Path<java.time.LocalDate> date =
                    root.get("serviceDate");
            if (from != null && to != null) {
                return cb.between(date, from, to);
            }
            if (from != null) {
                return cb.greaterThanOrEqualTo(date, from);
            }
            return cb.lessThanOrEqualTo(date, to);
        };
    }
}
