package com.mockinterview.mock_interview.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_question_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "question_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuestionProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "category")
    private String category;

    @Column(name = "topic")
    private String topic;

    @Column(name = "status")
    private String status; // "SOLVED", "ATTEMPTED"

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "selected_option", columnDefinition = "TEXT")
    private String selectedOption;

    @Column(name = "score")
    private Double score;

    @Column(name = "solved_at")
    private LocalDateTime solvedAt;

    @PrePersist
    protected void onCreate() {
        if (this.solvedAt == null) {
            this.solvedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "SOLVED";
        }
    }
}
