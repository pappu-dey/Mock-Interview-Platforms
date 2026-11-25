package com.mockinterview.mock_interview.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_activity", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "activity_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_id")
    private Integer activityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "sessions_count")
    private Integer sessionsCount;

    @Column(name = "questions_solved")
    private Integer questionsSolved;

    @Column(name = "mock_tests_completed")
    private Integer mockTestsCompleted;

    @Column(name = "total_activities")
    private Integer totalActivities;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        this.updatedAt = now;
        if (this.sessionsCount == null) this.sessionsCount = 0;
        if (this.questionsSolved == null) this.questionsSolved = 0;
        if (this.mockTestsCompleted == null) this.mockTestsCompleted = 0;
        if (this.totalActivities == null) this.totalActivities = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
