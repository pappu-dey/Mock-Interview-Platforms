package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.dto.dashboard.DashboardStatsDto;
import com.mockinterview.mock_interview.entity.Answer;
import com.mockinterview.mock_interview.entity.DailyActivity;
import com.mockinterview.mock_interview.entity.InterviewPerformance;
import com.mockinterview.mock_interview.repository.AnswerRepository;
import com.mockinterview.mock_interview.repository.DailyActivityRepository;
import com.mockinterview.mock_interview.repository.InterviewPerformanceRepository;
import com.mockinterview.mock_interview.repository.InterviewSessionRepository;
import com.mockinterview.mock_interview.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewPerformanceRepository performanceRepository;
    private final AnswerRepository answerRepository;
    private final DailyActivityRepository dailyActivityRepository;

    public DashboardServiceImpl(InterviewSessionRepository sessionRepository,
                                InterviewPerformanceRepository performanceRepository,
                                AnswerRepository answerRepository,
                                DailyActivityRepository dailyActivityRepository) {
        this.sessionRepository = sessionRepository;
        this.performanceRepository = performanceRepository;
        this.answerRepository = answerRepository;
        this.dailyActivityRepository = dailyActivityRepository;
    }

    @Override
    public DashboardStatsDto getDashboardStats(Integer userId) {

        // 1. Total interviews
        long totalInterviews = sessionRepository.countByUser_UserId(userId);

        // 2. Questions solved (max of answers count and daily activity sum)
        long answerCount = answerRepository.countBySession_User_UserId(userId);
        long activityCount = dailyActivityRepository
                .findByUser_UserIdAndActivityDateBetween(userId, LocalDate.now().minusYears(1), LocalDate.now())
                .stream()
                .mapToLong(a -> a.getQuestionsSolved() != null ? a.getQuestionsSolved() : 0)
                .sum();
        long questionsSolved = Math.max(answerCount, activityCount);

        // 3. Average score from performance records or answer records
        List<InterviewPerformance> performances =
                performanceRepository.findByUser_UserIdOrderBySession_StartTimeDesc(userId);
        double averageScore;
        if (!performances.isEmpty()) {
            averageScore = performances.stream()
                    .filter(p -> p.getOverallScore() != null)
                    .mapToDouble(InterviewPerformance::getOverallScore)
                    .average()
                    .orElse(0.0);
        } else if (answerCount > 0) {
            averageScore = answerRepository.findBySession_User_UserId(userId).stream()
                    .filter(a -> a.getScore() != null)
                    .mapToDouble(Answer::getScore)
                    .average()
                    .orElse(0.0);
        } else {
            averageScore = 0.0;
        }

        // 4. Current streak — consecutive days ending today (or yesterday)
        int currentStreak = calculateStreak(userId);

        // 5. Weekly change — how many questions/sessions this week vs last week
        String weeklyChange = calculateWeeklyChange(userId);

        return DashboardStatsDto.builder()
                .totalInterviews((int) totalInterviews)
                .averageScore(Math.round(averageScore * 10.0) / 10.0)
                .questionsSolved((int) questionsSolved)
                .currentStreak(currentStreak)
                .weeklyChange(weeklyChange)
                .build();
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private int calculateStreak(Integer userId) {
        LocalDate today = LocalDate.now();
        // Pull up to 90 days of history
        List<DailyActivity> activities = dailyActivityRepository
                .findByUser_UserIdAndActivityDateBetween(userId, today.minusDays(90), today);

        if (activities.isEmpty()) return 0;

        // Sort descending
        activities.sort(Comparator.comparing(DailyActivity::getActivityDate).reversed());

        int streak = 0;
        LocalDate expected = today;

        for (DailyActivity a : activities) {
            int solved = a.getQuestionsSolved() != null ? a.getQuestionsSolved() : 0;
            int sess = a.getSessionsCount() != null ? a.getSessionsCount() : 0;
            if (solved == 0 && sess == 0) continue;

            if (a.getActivityDate().equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else if (streak == 0 && a.getActivityDate().equals(today.minusDays(1))) {
                // Allow streak starting from yesterday
                streak++;
                expected = today.minusDays(2);
            } else {
                break;
            }
        }
        return streak;
    }

    private String calculateWeeklyChange(Integer userId) {
        LocalDate today = LocalDate.now();
        LocalDate thisWeekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate lastWeekStart = thisWeekStart.minusWeeks(1);
        LocalDate lastWeekEnd = thisWeekStart.minusDays(1);

        List<DailyActivity> thisWeek = dailyActivityRepository
                .findByUser_UserIdAndActivityDateBetween(userId, thisWeekStart, today);
        List<DailyActivity> lastWeek = dailyActivityRepository
                .findByUser_UserIdAndActivityDateBetween(userId, lastWeekStart, lastWeekEnd);

        int thisCount = thisWeek.stream()
                .mapToInt(a -> a.getSessionsCount() != null ? a.getSessionsCount() : 0)
                .sum();
        int lastCount = lastWeek.stream()
                .mapToInt(a -> a.getSessionsCount() != null ? a.getSessionsCount() : 0)
                .sum();

        int diff = thisCount - lastCount;
        if (diff >= 0) {
            return "+" + diff + " this wk";
        } else {
            return diff + " this wk";
        }
    }
}
