package com.mockinterview.mock_interview.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "performance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "performance_id")
    private Integer performanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(name = "communication_score")
    private Double communicationScore;

    @Column(name = "technical_score")
    private Double technicalScore;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "overall_score")
    private Double overallScore;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "improvements", columnDefinition = "TEXT")
    private String improvements;

    /**
     * Computes overall_score as the average of the three sub-scores before persisting.
     */
    @PrePersist
    @PreUpdate
    protected void computeOverallScore() {
        double comm = communicationScore != null ? communicationScore : 0.0;
        double tech = technicalScore != null ? technicalScore : 0.0;
        double conf = confidenceScore != null ? confidenceScore : 0.0;
        this.overallScore = (comm + tech + conf) / 3.0;
    }
}
