package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.entity.DailyActivity;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

/**
 * Shared utility for calculating user activity metrics (current streak,
 * longest streak, total active days, and totals) from DailyActivity records.
 */
final class ActivityStatsCalculator {

    static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");

    private ActivityStatsCalculator() {}

    static LocalDate today() {
        return LocalDate.now(APP_ZONE);
    }

    static boolean isQualifyingDay(DailyActivity a) {
        if (a == null) return false;
        int total = a.getTotalActivities() != null ? a.getTotalActivities() : 0;
        int solved = a.getQuestionsSolved() != null ? a.getQuestionsSolved() : 0;
        int mocks = a.getMockTestsCompleted() != null ? a.getMockTestsCompleted() : 0;
        int sessions = a.getSessionsCount() != null ? a.getSessionsCount() : 0;
        return total > 0 || solved > 0 || mocks > 0 || sessions > 0;
    }

    static int computeTotalActiveDays(List<DailyActivity> activities) {
        if (activities == null || activities.isEmpty()) return 0;
        Set<LocalDate> activeDates = new HashSet<>();
        for (DailyActivity a : activities) {
            if (isQualifyingDay(a) && a.getActivityDate() != null) {
                activeDates.add(a.getActivityDate());
            }
        }
        return activeDates.size();
    }

    static int computeCurrentStreak(List<DailyActivity> activities, LocalDate today) {
        if (activities == null || activities.isEmpty()) return 0;
        Set<LocalDate> activeDates = new HashSet<>();
        for (DailyActivity a : activities) {
            if (isQualifyingDay(a) && a.getActivityDate() != null) {
                activeDates.add(a.getActivityDate());
            }
        }
        if (activeDates.isEmpty()) return 0;

        LocalDate cursor;
        if (activeDates.contains(today)) {
            cursor = today;
        } else if (activeDates.contains(today.minusDays(1))) {
            // Do not prematurely reset streak during the day if user hasn't done activity today yet
            cursor = today.minusDays(1);
        } else {
            return 0;
        }

        int streak = 0;
        while (activeDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    static int computeLongestStreak(List<DailyActivity> activities) {
        if (activities == null || activities.isEmpty()) return 0;
        TreeSet<LocalDate> sortedDates = new TreeSet<>();
        for (DailyActivity a : activities) {
            if (isQualifyingDay(a) && a.getActivityDate() != null) {
                sortedDates.add(a.getActivityDate());
            }
        }
        if (sortedDates.isEmpty()) return 0;

        int longest = 0;
        int current = 0;
        LocalDate prev = null;
        for (LocalDate d : sortedDates) {
            if (prev != null && d.equals(prev.plusDays(1))) {
                current++;
            } else {
                current = 1;
            }
            if (current > longest) {
                longest = current;
            }
            prev = d;
        }
        return longest;
    }

    static int computeTotalMockTests(List<DailyActivity> activities) {
        if (activities == null || activities.isEmpty()) return 0;
        int sum = 0;
        for (DailyActivity a : activities) {
            if (a.getMockTestsCompleted() != null) {
                sum += a.getMockTestsCompleted();
            } else if (a.getSessionsCount() != null) {
                sum += a.getSessionsCount();
            }
        }
        return sum;
    }

    static int computeTotalActivities(List<DailyActivity> activities) {
        if (activities == null || activities.isEmpty()) return 0;
        int sum = 0;
        for (DailyActivity a : activities) {
            if (a.getTotalActivities() != null && a.getTotalActivities() > 0) {
                sum += a.getTotalActivities();
            } else {
                int solved = a.getQuestionsSolved() != null ? a.getQuestionsSolved() : 0;
                int mocks = a.getMockTestsCompleted() != null ? a.getMockTestsCompleted()
                        : (a.getSessionsCount() != null ? a.getSessionsCount() : 0);
                sum += solved + mocks;
            }
        }
        return sum;
    }
}
