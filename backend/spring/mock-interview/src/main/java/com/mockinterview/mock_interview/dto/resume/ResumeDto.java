package com.mockinterview.mock_interview.dto.resume;

import java.time.LocalDate;

public class ResumeDto {

    private Integer resumeId;
    private Integer userId;
    private String resumeUrl;
    private LocalDate uploadDate;

    public ResumeDto() {
    }

    public ResumeDto(Integer resumeId, Integer userId, String resumeUrl, LocalDate uploadDate) {
        this.resumeId = resumeId;
        this.userId = userId;
        this.resumeUrl = resumeUrl;
        this.uploadDate = uploadDate;
    }

    public Integer getResumeId() {
        return resumeId;
    }

    public void setResumeId(Integer resumeId) {
        this.resumeId = resumeId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public LocalDate getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDate uploadDate) {
        this.uploadDate = uploadDate;
    }
}
