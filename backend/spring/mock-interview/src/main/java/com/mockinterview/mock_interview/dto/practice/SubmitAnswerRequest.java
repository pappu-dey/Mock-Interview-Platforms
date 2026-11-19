package com.mockinterview.mock_interview.dto.practice;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitAnswerRequest {
    private Long questionId;
    private String category;
    private String topic;
    private Boolean isCorrect;
    private String selectedOption;
    private Double score;
}
