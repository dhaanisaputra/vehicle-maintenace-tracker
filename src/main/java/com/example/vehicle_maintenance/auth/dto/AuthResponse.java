package com.example.vehicle_maintenance.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserInfo user
) {

    public static AuthResponse of(String token, UserInfo user) {
        return new AuthResponse(token, "Bearer", user);
    }

    public record UserInfo(
            String id,
            String username,
            String email
    ) {
    }
}
