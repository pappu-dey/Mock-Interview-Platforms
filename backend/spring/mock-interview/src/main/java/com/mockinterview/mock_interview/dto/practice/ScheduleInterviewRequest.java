package com.mockinterview.mock_interview.dto.practice;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleInterviewRequest {
    private String company;
    private String role;
    private String startTime;
}
