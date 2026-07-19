package com.example.vehicle_maintenance.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties(
                "test-secret-key-that-is-long-enough-256-bits-minimum-for-hs256-000",
                3_600_000L);
        jwtService = new JwtService(properties);
    }

    @Test
    void shouldGenerateAndParseValidToken() {
        UUID userId = UUID.randomUUID();

        String token = jwtService.generateToken(userId, "user@example.com");

        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token)).isTrue();
        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
    }

    @Test
    void shouldRejectMalformedToken() {
        assertThat(jwtService.isTokenValid("not-a-real-token")).isFalse();
    }

    @Test
    void shouldRejectExpiredToken() {
        JwtProperties expired = new JwtProperties(
                "test-secret-key-that-is-long-enough-256-bits-minimum-for-hs256-000",
                -1_000L);
        JwtService expiredService = new JwtService(expired);

        String token = expiredService.generateToken(UUID.randomUUID(), "user@example.com");

        assertThat(expiredService.isTokenValid(token)).isFalse();
    }
}
