package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Integer> {

    List<InterviewSession> findByUser_UserIdOrderByStartTimeDesc(Integer userId);

    List<InterviewSession> findByUser_UserIdAndEndTimeIsNullOrderByStartTimeDesc(Integer userId);

    long countByUser_UserId(Integer userId);
}
