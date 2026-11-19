package com.mockinterview.mock_interview.dto.practice;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitSessionRequest {
    private String category;
    private String topic;
    private String company;
    private String roleName;
    private Integer totalQuestions;
    private Integer correctCount;
    private Double score;
    private Integer timeSpentSeconds;
    private String type; // e.g. "Mock", "Practice", "Aptitude"
}
