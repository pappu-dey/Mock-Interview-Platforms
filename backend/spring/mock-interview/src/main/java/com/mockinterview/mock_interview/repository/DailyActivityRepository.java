package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.DailyActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyActivityRepository extends JpaRepository<DailyActivity, Integer> {

    List<DailyActivity> findByUser_UserIdAndActivityDateBetween(
            Integer userId, LocalDate startDate, LocalDate endDate);

    Optional<DailyActivity> findByUser_UserIdAndActivityDate(
            Integer userId, LocalDate activityDate);
}
