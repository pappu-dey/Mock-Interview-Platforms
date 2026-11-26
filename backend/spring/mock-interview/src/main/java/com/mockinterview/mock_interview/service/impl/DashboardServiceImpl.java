package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.dto.dashboard.DashboardStatsDto;
import com.mockinterview.mock_interview.entity.Answer;
import com.mockinterview.mock_interview.entity.DailyActivity;
import com.mockinterview.mock_interview.entity.InterviewPerformance;
import com.mockinterview.mock_interview.entity.Profile;
import com.mockinterview.mock_interview.repository.AnswerRepository;
import com.mockinterview.mock_interview.repository.DailyActivityRepository;
import com.mockinterview.mock_interview.repository.InterviewPerformanceRepository;
import com.mockinterview.mock_interview.repository.InterviewSessionRepository;
import com.mockinterview.mock_interview.repository.ProfileRepository;
import com.mockinterview.mock_interview.repository.UserQuestionProgressRepository;
import com.mockinterview.mock_interview.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewPerformanceRepository performanceRepository;
    private final AnswerRepository answerRepository;
    private final DailyActivityRepository dailyActivityRepository;
    private final UserQuestionProgressRepository userQuestionProgressRepository;
    private final ProfileRepository profileRepository;

    public DashboardServiceImpl(InterviewSessionRepository sessionRepository,
                                InterviewPerformanceRepository performanceRepository,
                                AnswerRepository answerRepository,
                                DailyActivityRepository dailyActivityRepository,
                                UserQuestionProgressRepository userQuestionProgressRepository,
                                ProfileRepository profileRepository) {
        this.sessionRepository = sessionRepository;
        this.performanceRepository = performanceRepository;
        this.answerRepository = answerRepository;
        this.dailyActivityRepository = dailyActivityRepository;
        this.userQuestionProgressRepository = userQuestionProgressRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    public DashboardStatsDto getDashboardStats(Integer userId) {
        // 1. Total interviews / completed sessions
        long totalInterviews = sessionRepository.countByUser_UserId(userId);

        // 2. Questions solved from UserQuestionProgress (unique solved) & DailyActivity
        long solvedProgressCount = userQuestionProgressRepository.countByUser_UserIdAndStatus(userId, "SOLVED");
        List<DailyActivity> allActivities = dailyActivityRepository.findByUser_UserIdOrderByActivityDateDesc(userId);
        long activitySolvedSum = allActivities.stream()
                .mapToLong(a -> a.getQuestionsSolved() != null ? a.getQuestionsSolved() : 0)
                .sum();
        long questionsSolved = Math.max(solvedProgressCount, activitySolvedSum);

        // 3. Average score from performance records or answer records
        List<InterviewPerformance> performances =
                performanceRepository.findByUser_UserIdOrderBySession_StartTimeDesc(userId);
        double averageScore = 0.0;
        if (!performances.isEmpty()) {
            averageScore = performances.stream()
                    .filter(p -> p.getOverallScore() != null)
                    .mapToDouble(InterviewPerformance::getOverallScore)
                    .average()
                    .orElse(0.0);
        } else {
            List<Answer> answers = answerRepository.findBySession_User_UserId(userId);
            if (!answers.isEmpty()) {
                averageScore = answers.stream()
                        .filter(a -> a.getScore() != null)
                        .mapToDouble(Answer::getScore)
                        .average()
                        .orElse(0.0);
            }
        }

        // 4. Activity tracking metrics (from DailyActivity records)
        LocalDate today = ActivityStatsCalculator.today();
        int currentStreak = ActivityStatsCalculator.computeCurrentStreak(allActivities, today);
        int longestStreak = ActivityStatsCalculator.computeLongestStreak(allActivities);
        int totalActiveDays = ActivityStatsCalculator.computeTotalActiveDays(allActivities);
        int mockTestsCompleted = ActivityStatsCalculator.computeTotalMockTests(allActivities);
        int totalActivities = ActivityStatsCalculator.computeTotalActivities(allActivities);

        // 5. Weekly change
        String weeklyChange = calculateWeeklyChange(userId, today);

        String fullName = profileRepository.findByUser_UserId(userId)
                .map(Profile::getFullName)
                .filter(name -> name != null && !name.isBlank())
                .orElse("");

        return DashboardStatsDto.builder()
                .fullName(fullName)
                .totalInterviews((int) totalInterviews)
                .averageScore(Math.round(averageScore * 10.0) / 10.0)
                .questionsSolved((int) questionsSolved)
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalActiveDays(totalActiveDays)
                .mockTestsCompleted(mockTestsCompleted)
                .totalActivities(totalActivities)
                .weeklyChange(weeklyChange)
                .build();
    }

    private String calculateWeeklyChange(Integer userId, LocalDate today) {
        LocalDate thisWeekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate lastWeekStart = thisWeekStart.minusWeeks(1);
        LocalDate lastWeekEnd = thisWeekStart.minusDays(1);

        List<DailyActivity> thisWeek = dailyActivityRepository
                .findByUser_UserIdAndActivityDateBetween(userId, thisWeekStart, today);
        List<DailyActivity> lastWeek = dailyActivityRepository
                .findByUser_UserIdAndActivityDateBetween(userId, lastWeekStart, lastWeekEnd);

        int thisCount = ActivityStatsCalculator.computeTotalActivities(thisWeek);
        int lastCount = ActivityStatsCalculator.computeTotalActivities(lastWeek);

        int diff = thisCount - lastCount;
        return (diff >= 0 ? "+" : "") + diff + " this wk";
    }
}
