package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.UserQuestionProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuestionProgressRepository extends JpaRepository<UserQuestionProgress, Long> {

    List<UserQuestionProgress> findByUser_UserId(Integer userId);

    Optional<UserQuestionProgress> findByUser_UserIdAndQuestionId(Integer userId, Long questionId);

    List<UserQuestionProgress> findByUser_UserIdAndCategoryIgnoreCase(Integer userId, String category);

    List<UserQuestionProgress> findByUser_UserIdAndTopicIgnoreCase(Integer userId, String topic);

    long countByUser_UserId(Integer userId);

    long countByUser_UserIdAndTopicIgnoreCase(Integer userId, String topic);
}
