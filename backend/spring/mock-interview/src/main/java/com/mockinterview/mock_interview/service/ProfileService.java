package com.mockinterview.mock_interview.service;

import com.mockinterview.mock_interview.dto.profile.ProfileDto;

public interface ProfileService {

    /**
     * Fetch the profile for the given user.
     * Returns an empty ProfileDto (all nulls) if no profile row exists yet.
     */
    ProfileDto getProfile(Integer userId);

    /**
     * Create or update the profile for the given user.
     * Returns the saved ProfileDto.
     */
    ProfileDto saveProfile(Integer userId, ProfileDto dto);
}
