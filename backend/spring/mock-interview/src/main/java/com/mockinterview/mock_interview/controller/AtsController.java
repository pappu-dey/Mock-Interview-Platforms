package com.mockinterview.mock_interview.controller;

import com.mockinterview.mock_interview.dto.resume.AtsAnalysisRequest;
import com.mockinterview.mock_interview.service.AtsService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AtsController — POST /api/ats/analyze
 *
 * Accepts extracted resume text + target role, runs AI analysis, and returns
 * the ATS report as JSON. Nothing is stored — no file, no text, no result.
 *
 * Requires a valid JWT (handled by SecurityConfig — all /api/** except auth/companies).
 */
@RestController
@RequestMapping("/api/ats")
public class AtsController {

    private final AtsService atsService;

    public AtsController(AtsService atsService) {
        this.atsService = atsService;
    }

    /**
     * POST /api/ats/analyze
     * Body: { "resumeText": "...", "targetRole": "Full Stack Developer" }
     * Returns: raw ATS analysis JSON from AI engine
     */
    @PostMapping(value = "/analyze",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> analyzeResume(@RequestBody AtsAnalysisRequest request) {
        if (request.getResumeText() == null || request.getResumeText().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("{\"error\":\"resumeText is required\"}");
        }

        try {
            String result = atsService.analyzeResume(
                    request.getResumeText(),
                    request.getTargetRole()
            );
            // Return the raw JSON string as the response body
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}");
        }
    }
}
