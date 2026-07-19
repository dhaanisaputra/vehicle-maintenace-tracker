package com.example.vehicle_maintenance.common.response;

public record ValidationError(
        String field,
        String message
) {
}
