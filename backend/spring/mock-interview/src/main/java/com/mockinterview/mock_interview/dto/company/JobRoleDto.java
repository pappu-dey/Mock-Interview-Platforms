package com.mockinterview.mock_interview.dto.company;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRoleDto {
    private Integer roleId;
    private Integer companyId;
    private String roleName;
    private String location;
    private String salary;
    private String experience;
    private String eligibility;
    private String technicalTopics;
    private String description;
    private Boolean isOpen;
    private List<HiringProcessDto> hiringProcesses;
}
