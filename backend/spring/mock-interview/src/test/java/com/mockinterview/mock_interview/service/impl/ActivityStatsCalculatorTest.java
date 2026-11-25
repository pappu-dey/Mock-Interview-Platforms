package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.entity.DailyActivity;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ActivityStatsCalculatorTest {

    private DailyActivity activity(LocalDate date, int questionsSolved, int mockTests, int total) {
        return DailyActivity.builder()
                .activityDate(date)
                .questionsSolved(questionsSolved)
                .mockTestsCompleted(mockTests)
                .sessionsCount(mockTests)
                .totalActivities(total)
                .build();
    }

    @Test
    void newUserHasZeroActiveDaysAndZeroStreaks() {
        LocalDate today = LocalDate.of(2026, 11, 26);
        assertEquals(0, ActivityStatsCalculator.computeTotalActiveDays(List.of()));
        assertEquals(0, ActivityStatsCalculator.computeCurrentStreak(List.of(), today));
        assertEquals(0, ActivityStatsCalculator.computeLongestStreak(List.of()));
    }

    @Test
    void multipleActivitiesSameDayCountAsOneActiveDayAndStreakOne() {
        LocalDate today = LocalDate.of(2026, 11, 26);
        List<DailyActivity> list = List.of(activity(today, 10, 1, 11));

        assertEquals(1, ActivityStatsCalculator.computeTotalActiveDays(list));
        assertEquals(1, ActivityStatsCalculator.computeCurrentStreak(list, today));
        assertEquals(1, ActivityStatsCalculator.computeLongestStreak(list));
        assertEquals(1, ActivityStatsCalculator.computeTotalMockTests(list));
        assertEquals(11, ActivityStatsCalculator.computeTotalActivities(list));
    }

    @Test
    void consecutiveDaysIncreaseStreakAndPreserveYesterdayStreakBeforeTodayActivity() {
        LocalDate today = LocalDate.of(2026, 11, 26);
        List<DailyActivity> list = List.of(
                activity(today.minusDays(1), 2, 0, 2),
                activity(today.minusDays(2), 1, 1, 2),
                activity(today.minusDays(3), 3, 0, 3)
        );

        assertEquals(3, ActivityStatsCalculator.computeTotalActiveDays(list));
        assertEquals(3, ActivityStatsCalculator.computeCurrentStreak(list, today));
        assertEquals(3, ActivityStatsCalculator.computeLongestStreak(list));
    }

    @Test
    void missingDayBreaksCurrentStreakButPreservesLongestStreakAndActiveDays() {
        LocalDate today = LocalDate.of(2026, 11, 26);
        List<DailyActivity> list = List.of(
                activity(today, 1, 0, 1),
                // yesterday (minusDays(1)) missed
                activity(today.minusDays(2), 2, 0, 2),
                activity(today.minusDays(3), 1, 0, 1),
                activity(today.minusDays(4), 1, 0, 1)
        );

        assertEquals(4, ActivityStatsCalculator.computeTotalActiveDays(list));
        assertEquals(1, ActivityStatsCalculator.computeCurrentStreak(list, today));
        assertEquals(3, ActivityStatsCalculator.computeLongestStreak(list));
    }
}
