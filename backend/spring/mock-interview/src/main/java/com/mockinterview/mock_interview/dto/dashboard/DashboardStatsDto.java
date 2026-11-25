package com.mockinterview.mock_interview.dto.dashboard;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private int totalInterviews;
    private double averageScore;
    private int questionsSolved;
    private int currentStreak;
    private int longestStreak;
    private int totalActiveDays;
    private int mockTestsCompleted;
    private int totalActivities;
    private String weeklyChange;
}
