package com.mockinterview.mock_interview.dto.resume;

/**
 * Request body for POST /api/ats/analyze
 * Contains extracted resume text and the target role.
 * Nothing is stored — this is purely ephemeral/transient.
 */
public class AtsAnalysisRequest {

    private String resumeText;
    private String targetRole;

    public AtsAnalysisRequest() {}

    public AtsAnalysisRequest(String resumeText, String targetRole) {
        this.resumeText = resumeText;
        this.targetRole = targetRole;
    }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
}
