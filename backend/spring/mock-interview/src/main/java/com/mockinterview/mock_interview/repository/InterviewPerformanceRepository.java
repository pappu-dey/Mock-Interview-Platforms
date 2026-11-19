package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.InterviewPerformance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewPerformanceRepository extends JpaRepository<InterviewPerformance, Integer> {

    List<InterviewPerformance> findByUser_UserIdOrderBySession_StartTimeDesc(Integer userId);
}
