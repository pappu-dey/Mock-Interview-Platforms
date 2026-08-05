package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.Resume;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Integer> {

    Optional<Resume> findByUserId(Integer userId);

    void deleteByUserId(Integer userId);
}