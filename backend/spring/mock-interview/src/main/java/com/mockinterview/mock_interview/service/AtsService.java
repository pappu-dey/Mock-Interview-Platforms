package com.mockinterview.mock_interview.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * AtsService — ephemeral ATS analysis powered by AI.
 *
 * IMPORTANT: This service does NOT store, log, or persist any resume
 * text, file content, or personal data. The text is sent to the AI
 * model, the response is returned, and nothing is saved.
 */
@Service
public class AtsService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_ENDPOINT =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=";

    private static final String PROMPT_TEMPLATE = """
            You are a professional ATS (Applicant Tracking System) expert and executive resume specialist.
            Analyze the resume text below against the target role "%s".

            STRICT RULES:
            - Respond ONLY with a raw, valid JSON object.
            - No markdown, no code fences, no explanatory text outside the JSON.

            JSON schema:
            {
              "atsScore": <integer 0-100>,
              "summary": "<2-3 sentence summary>",
              "breakdown": [
                { "category": "Contact Information",       "score": <int>, "feedback": "<string>" },
                { "category": "Work Experience & Metrics", "score": <int>, "feedback": "<string>" },
                { "category": "Technical & Soft Skills",   "score": <int>, "feedback": "<string>" },
                { "category": "Action Verbs & Impact",     "score": <int>, "feedback": "<string>" },
                { "category": "Formatting & ATS Readability","score": <int>, "feedback": "<string>" },
                { "category": "Education & Certifications","score": <int>, "feedback": "<string>" }
              ],
              "presentKeywords": ["<keyword>", ...],
              "missingKeywords": ["<keyword>", ...],
              "missingSections": [
                { "section": "<name>", "severity": "high|medium|low", "reason": "<string>" }
              ],
              "bulletImprovements": [
                { "original": "<weak bullet>", "improved": "<STAR bullet>", "reason": "<why>" }
              ],
              "topActionItems": ["<item1>", "<item2>", "<item3>"]
            }

            Target Role: %s

            Resume Text:
            %s
            """;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Analyzes the provided resume text for ATS compatibility.
     * The text is never stored — it exists only in-memory during this call.
     *
     * @param resumeText  extracted plain text of the resume (max ~5000 chars used)
     * @param targetRole  job title to evaluate against
     * @return raw JSON string from AI — caller returns it directly to frontend
     */
    public String analyzeResume(String resumeText, String targetRole) throws Exception {
        String role = (targetRole == null || targetRole.isBlank()) ? "Software Engineer" : targetRole.trim();

        // Trim to 4500 chars to stay well within token limits
        String safeText = resumeText.length() > 4500
                ? resumeText.substring(0, 4500) + "\n[truncated for analysis]"
                : resumeText;

        String prompt = PROMPT_TEMPLATE.formatted(role, role, safeText);

        String requestBody = objectMapper.writeValueAsString(
                java.util.Map.of(
                        "contents", java.util.List.of(
                                java.util.Map.of("role", "user",
                                        "parts", java.util.List.of(
                                                java.util.Map.of("text", prompt)))
                        ),
                        "generationConfig", java.util.Map.of(
                                "temperature", 0.2,
                                "maxOutputTokens", 2048,
                                "responseMimeType", "application/json"
                        )
                )
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_ENDPOINT + geminiApiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("AI analysis service error: HTTP " + response.statusCode());
        }

        // Extract the inner JSON text from the Gemini response wrapper
        JsonNode root = objectMapper.readTree(response.body());
        String rawJson = root.path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();

        if (rawJson == null || rawJson.isBlank()) {
            throw new RuntimeException("AI returned empty analysis. Please try again.");
        }

        // Validate it parses as JSON before returning
        objectMapper.readTree(rawJson); // throws if malformed
        return rawJson;
    }
}
