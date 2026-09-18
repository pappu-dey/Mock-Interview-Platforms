package com.mockinterview.mock_interview.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "salary", length = 100)
    private String salary;

    @Column(name = "experience", length = 50)
    private String experience;

    @Column(name = "eligibility", columnDefinition = "TEXT")
    private String eligibility;

    @Column(name = "technical_topics", columnDefinition = "TEXT")
    private String technicalTopics;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_open")
    private Boolean isOpen;

    @OneToMany(mappedBy = "jobRole", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<HiringProcess> hiringProcesses = new ArrayList<>();
}
