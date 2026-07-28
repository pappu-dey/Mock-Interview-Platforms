package com.mockinterview.mock_interview.dto.profile;

/**
 * ProfileDto — used for both GET (response) and PUT (request body).
 * Includes profileId and userId metadata.
 */
public class ProfileDto {

    private Integer profileId;
    private Integer userId;
    private String fullName;
    private String phone;
    private String college;
    private String branch;
    private String graduationYear;
    private String skills;
    private String linkedinUrl;
    private String leetcodeUrl;
    private String githubUrl;

    // ─── No-arg constructor (required by Jackson) ───────────────────────────────
    public ProfileDto() {}

    // ─── All-args constructor ────────────────────────────────────────────────────
    public ProfileDto(Integer profileId, Integer userId, String fullName, String phone,
                      String college, String branch, String graduationYear, String skills,
                      String linkedinUrl, String leetcodeUrl, String githubUrl) {
        this.profileId      = profileId;
        this.userId         = userId;
        this.fullName       = fullName;
        this.phone          = phone;
        this.college        = college;
        this.branch         = branch;
        this.graduationYear = graduationYear;
        this.skills         = skills;
        this.linkedinUrl    = linkedinUrl;
        this.leetcodeUrl    = leetcodeUrl;
        this.githubUrl      = githubUrl;
    }

    // ─── Getters ─────────────────────────────────────────────────────────────────
    public Integer getProfileId()      { return profileId; }
    public Integer getUserId()         { return userId; }
    public String getFullName()       { return fullName; }
    public String getPhone()          { return phone; }
    public String getCollege()        { return college; }
    public String getBranch()         { return branch; }
    public String getGraduationYear() { return graduationYear; }
    public String getSkills()         { return skills; }
    public String getLinkedinUrl()    { return linkedinUrl; }
    public String getLeetcodeUrl()    { return leetcodeUrl; }
    public String getGithubUrl()      { return githubUrl; }

    // ─── Setters ─────────────────────────────────────────────────────────────────
    public void setProfileId(Integer profileId)          { this.profileId = profileId; }
    public void setUserId(Integer userId)                { this.userId = userId; }
    public void setFullName(String fullName)             { this.fullName = fullName; }
    public void setPhone(String phone)                   { this.phone = phone; }
    public void setCollege(String college)               { this.college = college; }
    public void setBranch(String branch)                 { this.branch = branch; }
    public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }
    public void setSkills(String skills)                 { this.skills = skills; }
    public void setLinkedinUrl(String linkedinUrl)       { this.linkedinUrl = linkedinUrl; }
    public void setLeetcodeUrl(String leetcodeUrl)       { this.leetcodeUrl = leetcodeUrl; }
    public void setGithubUrl(String githubUrl)           { this.githubUrl = githubUrl; }
}
