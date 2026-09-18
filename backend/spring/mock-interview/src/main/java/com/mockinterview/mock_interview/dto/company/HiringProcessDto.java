package com.mockinterview.mock_interview.dto.company;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HiringProcessDto {
    private Integer processId;
    private Integer roundNumber;
    private String roundName;
    private String description;
}
