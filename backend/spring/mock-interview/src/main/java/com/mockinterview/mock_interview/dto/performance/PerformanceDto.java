package com.mockinterview.mock_interview.dto.performance;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceDto {

    // ── KPIs ─────────────────────────────────────────────────────────────
    private int totalSessions;
    private double averageScore;
    private int currentStreak;
    private String bestCategory;
    private double bestCategoryScore;
    private int bestCategorySessions;

    // ── Score trend (last N sessions) ────────────────────────────────────
    private List<ScoreTrendItem> scoreTrend;

    // ── Skill breakdown by category ──────────────────────────────────────
    private List<SkillBreakdownItem> skillBreakdown;

    // ── Recent sessions ──────────────────────────────────────────────────
    private List<RecentSessionItem> recentSessions;

    // ── Strengths & improvements ─────────────────────────────────────────
    private List<String> strengths;
    private List<String> improvements;

    // ── Weekly activity (sessions per day, 28-day / 7-day) ────────────────
    private List<Integer> weeklyActivity;

    // ── Placement readiness % ────────────────────────────────────────────
    private double placementReadiness;

    // ── Inner DTOs ───────────────────────────────────────────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScoreTrendItem {
        private String session; // e.g. "S1"
        private String sessionLabel; // e.g. "Session 1"
        private double score;
        private String date;
        private String topic;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillBreakdownItem {
        private String label;
        private String category;
        private double score;
        private int sessions;
        private int totalQuestions;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentSessionItem {
        private Integer id;
        private Integer sessionId;
        private String topic;
        private String date;
        private Double score;
        private Double overallScore;
        private String time;
        private String type;
        private String roleName;
    }
}
