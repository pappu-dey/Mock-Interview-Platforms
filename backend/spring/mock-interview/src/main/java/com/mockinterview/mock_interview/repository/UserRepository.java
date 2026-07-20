package com.mockinterview.mock_interview.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mockinterview.mock_interview.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}