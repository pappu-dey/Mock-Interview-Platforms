package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.dto.profile.ProfileDto;
import com.mockinterview.mock_interview.entity.Profile;
import com.mockinterview.mock_interview.entity.User;
import com.mockinterview.mock_interview.repository.ProfileRepository;
import com.mockinterview.mock_interview.repository.UserRepository;
import com.mockinterview.mock_interview.service.ProfileService;
import org.springframework.stereotype.Service;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository    userRepository;

    public ProfileServiceImpl(ProfileRepository profileRepository,
                               UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository    = userRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────────

    @Override
    public ProfileDto getProfile(Integer userId) {
        return profileRepository.findByUser_UserId(userId)
                .map(this::toDto)
                .orElseGet(() -> {
                    ProfileDto empty = new ProfileDto();
                    empty.setUserId(userId);
                    return empty;
                });
    }

    @Override
    public ProfileDto saveProfile(Integer userId, ProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Look up existing profile for this user, or instantiate a new one
        Profile profile = profileRepository.findByUser_UserId(userId)
                .orElseGet(Profile::new);

        // Always bind the user entity to populate user_id foreign key
        profile.setUser(user);

        // Map form values into entity columns
        profile.setFullName(dto.getFullName() != null ? dto.getFullName() : "");
        profile.setPhone(dto.getPhone());
        profile.setCollege(dto.getCollege());
        profile.setBranch(dto.getBranch());
        profile.setGraduationYear(dto.getGraduationYear());
        profile.setSkills(dto.getSkills());
        profile.setLinkedinUrl(dto.getLinkedinUrl());
        profile.setLeetcodeUrl(dto.getLeetcodeUrl());
        profile.setGithubUrl(dto.getGithubUrl());

        // Save entity to MySQL (inserts profile_id if new, updates if existing)
        Profile saved = profileRepository.save(profile);
        return toDto(saved);
    }

    // ─── Mapping helper ───────────────────────────────────────────────────────────

    private ProfileDto toDto(Profile p) {
        return new ProfileDto(
                p.getProfileId(),
                p.getUser() != null ? p.getUser().getUserId() : null,
                p.getFullName(),
                p.getPhone(),
                p.getCollege(),
                p.getBranch(),
                p.getGraduationYear(),
                p.getSkills(),
                p.getLinkedinUrl(),
                p.getLeetcodeUrl(),
                p.getGithubUrl()
        );
    }
}
