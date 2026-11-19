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
    private String weeklyChange;
}
