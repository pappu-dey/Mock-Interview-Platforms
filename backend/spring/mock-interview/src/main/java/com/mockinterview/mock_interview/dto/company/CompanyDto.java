package com.mockinterview.mock_interview.dto.company;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDto {
    private Integer companyId;
    private String companyName;
    private String companyWebsite;
    private String companyLogo;
    private String headquarters;
    private String employees;
    private Double rating;
    private String difficulty;
    private String insiderTips;
    private List<JobRoleDto> jobRoles;
}
