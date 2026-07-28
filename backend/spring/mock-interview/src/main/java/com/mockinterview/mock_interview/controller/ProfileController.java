package com.mockinterview.mock_interview.controller;

import com.mockinterview.mock_interview.dto.profile.ProfileDto;
import com.mockinterview.mock_interview.entity.User;
import com.mockinterview.mock_interview.repository.UserRepository;
import com.mockinterview.mock_interview.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService  profileService;
    private final UserRepository  userRepository;

    public ProfileController(ProfileService profileService,
                              UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/profile
     * Returns the logged-in user's profile data.
     * Returns an empty ProfileDto (all nulls) if the profile hasn't been filled yet.
     */
    @GetMapping
    public ResponseEntity<ProfileDto> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        Integer userId = resolveUserId(userDetails);
        ProfileDto dto = profileService.getProfile(userId);
        return ResponseEntity.ok(dto);
    }

    /**
     * PUT /api/profile
     * Creates or updates the logged-in user's profile.
     * Returns the saved ProfileDto.
     */
    @PutMapping
    public ResponseEntity<ProfileDto> saveProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileDto dto) {

        Integer userId   = resolveUserId(userDetails);
        ProfileDto saved = profileService.saveProfile(userId, dto);
        return ResponseEntity.ok(saved);
    }

    // ─── helper — look up user_id from the email stored in the JWT subject ────────
    private Integer resolveUserId(UserDetails userDetails) {
        String email = userDetails.getUsername();   // JWT subject = email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB: " + email));
        return user.getUserId();
    }
}
