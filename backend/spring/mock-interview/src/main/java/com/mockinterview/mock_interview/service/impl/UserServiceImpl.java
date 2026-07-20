package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.dto.auth.LoginRequest;
import com.mockinterview.mock_interview.dto.auth.LoginResponse;
import com.mockinterview.mock_interview.dto.auth.RegisterRequest;
import com.mockinterview.mock_interview.dto.auth.RegisterResponse;
import com.mockinterview.mock_interview.entity.Role;
import com.mockinterview.mock_interview.entity.User;
import com.mockinterview.mock_interview.repository.UserRepository;
import com.mockinterview.mock_interview.security.JwtService;
import com.mockinterview.mock_interview.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           AuthenticationManager authenticationManager,
                           UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    // ─── Register ────────────────────────────────────────────────────────────────

    @Override
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return new RegisterResponse("User Registered Successfully");
    }

    // ─── Login ───────────────────────────────────────────────────────────────────

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. Authenticate — throws BadCredentialsException if wrong email/password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Load UserDetails (Spring Security principal)
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        // 3. Generate JWT
        String jwtToken = jwtService.generateToken(userDetails);

        // 4. Fetch the Role from DB to include in the response
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new LoginResponse(jwtToken, "Login successful", user.getRole().name());
    }
}