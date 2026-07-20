package com.example.vehicle_maintenance.auth;

import com.example.vehicle_maintenance.auth.dto.AuthResponse;
import com.example.vehicle_maintenance.auth.dto.ChangePasswordRequest;
import com.example.vehicle_maintenance.auth.dto.LoginRequest;
import com.example.vehicle_maintenance.auth.dto.RegisterRequest;
import com.example.vehicle_maintenance.auth.dto.UpdateProfileRequest;
import com.example.vehicle_maintenance.common.exception.BusinessException;
import com.example.vehicle_maintenance.common.exception.DuplicateResourceException;
import com.example.vehicle_maintenance.security.CurrentUserProvider;
import com.example.vehicle_maintenance.security.JwtService;
import com.example.vehicle_maintenance.user.User;
import com.example.vehicle_maintenance.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username is already taken");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        User saved = userRepository.save(user);

        log.info("User registered successfully with id: {}", saved.getId());
        return buildAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        log.info("User logged in successfully: {}", user.getId());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId().toString(), user.getUsername(), user.getEmail());
        return AuthResponse.of(token, userInfo);
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserInfo getProfile() {
        User user = userRepository.getReferenceById(currentUserProvider.getCurrentUserId());
        return new AuthResponse.UserInfo(user.getId().toString(), user.getUsername(), user.getEmail());
    }

    @Transactional
    public AuthResponse.UserInfo updateProfile(UpdateProfileRequest request) {
        User user = userRepository.getReferenceById(currentUserProvider.getCurrentUserId());
        if (!user.getUsername().equals(request.username())
                && userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username is already taken");
        }
        user.setUsername(request.username());
        User saved = userRepository.saveAndFlush(user);
        return new AuthResponse.UserInfo(saved.getId().toString(), saved.getUsername(), saved.getEmail());
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.getReferenceById(currentUserProvider.getCurrentUserId());
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.saveAndFlush(user);
        log.info("Password changed for user: {}", user.getId());
    }
}
