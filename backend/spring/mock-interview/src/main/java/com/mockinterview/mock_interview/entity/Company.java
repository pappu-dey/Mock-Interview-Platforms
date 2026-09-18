package com.mockinterview.mock_interview.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(name = "company_website", length = 255)
    private String companyWebsite;

    @Column(name = "company_logo", length = 255)
    private String companyLogo;

    @Column(name = "headquarters", length = 100)
    private String headquarters;

    @Column(name = "employees", length = 50)
    private String employees;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "difficulty", length = 50)
    private String difficulty;

    @Column(name = "insider_tips", columnDefinition = "TEXT")
    private String insiderTips;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobRole> jobRoles = new ArrayList<>();
}
