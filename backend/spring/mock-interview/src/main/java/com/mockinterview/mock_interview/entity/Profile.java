package com.mockinterview.mock_interview.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Integer profileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName = "";

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "college", length = 100)
    private String college;

    @Column(name = "branch", length = 255)
    private String branch;

    @Column(name = "graduation_year", length = 255)
    private String graduationYear;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "leetcode_url", length = 255)
    private String leetcodeUrl;

    @Column(name = "github_url", length = 255)
    private String githubUrl;
}
