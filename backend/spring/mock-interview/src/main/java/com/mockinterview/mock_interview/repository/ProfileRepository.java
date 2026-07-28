package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Integer> {

    /**
     * Find the profile row that belongs to the given user.
     * Returns Optional.empty() if the user hasn't filled out their profile yet.
     */
    Optional<Profile> findByUser_UserId(Integer userId);
}
