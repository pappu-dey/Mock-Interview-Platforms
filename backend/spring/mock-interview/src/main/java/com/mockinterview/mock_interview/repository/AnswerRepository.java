package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Integer> {

    long countBySession_User_UserId(Integer userId);

    List<Answer> findBySession_SessionId(Integer sessionId);

    List<Answer> findBySession_User_UserId(Integer userId);
}
