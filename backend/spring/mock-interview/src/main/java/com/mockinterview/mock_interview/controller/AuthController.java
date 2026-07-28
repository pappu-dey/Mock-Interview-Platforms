package com.mockinterview.mock_interview.controller;

import com.mockinterview.mock_interview.dto.auth.ForgotPasswordRequest;
import com.mockinterview.mock_interview.dto.auth.LoginRequest;
import com.mockinterview.mock_interview.dto.auth.LoginResponse;
import com.mockinterview.mock_interview.dto.auth.RegisterRequest;
import com.mockinterview.mock_interview.dto.auth.RegisterResponse;
import com.mockinterview.mock_interview.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/auth/register
     * Public endpoint — no JWT required.
     * Creates a new user account and returns a success message.
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        RegisterResponse response = userService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Public endpoint — no JWT required.
     * Authenticates credentials and returns a signed JWT token + role.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/forgot-password
     * Public endpoint — no JWT required.
     * Resets user password by email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<RegisterResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        RegisterResponse response = userService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }
}