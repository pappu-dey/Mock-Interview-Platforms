package com.mockinterview.mock_interview.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://mock-interview-platforms.vercel.app"})
public class TripaAiController {

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    private static final List<String> GEMINI_MODELS = List.of(
            "gemini-2.5-flash",
            "gemini-2.0-flash"
    );

    private static final String DEFAULT_SYSTEM_INSTRUCTION = """
            You are Tripa, a friendly and knowledgeable AI education assistant for the PrepPilot mock interview platform.
            Your role is to help students with education-related topics ONLY:
            programming concepts, DSA, CS fundamentals (OS, DBMS, Networks, OOP), aptitude, logical reasoning,
            interview preparation tips, career advice, company interview processes, and resume advice.
            If a user asks something off-topic, politely decline and redirect them to ask something education-related.
            Keep responses concise, clear, and helpful.""";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/tripa")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> payload) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.startsWith("<YOUR_")) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Gemini API key is not configured on the server."));
        }

        String message = payload.get("message") != null ? String.valueOf(payload.get("message")).trim() : "";
        if (message.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty."));
        }

        String sysInstruction = payload.get("systemInstruction") != null
                ? String.valueOf(payload.get("systemInstruction"))
                : DEFAULT_SYSTEM_INSTRUCTION;

        List<Map<String, Object>> contents = new ArrayList<>();
        Object rawHistory = payload.get("history");
        if (rawHistory instanceof List<?> histList) {
            for (Object item : histList) {
                if (item instanceof Map<?, ?> m) {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("role", m.get("role"));
                    entry.put("parts", m.get("parts"));
                    contents.add(entry);
                }
            }
        }
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", message))
        ));

        Map<String, Object> bodyMap = new LinkedHashMap<>();
        bodyMap.put("systemInstruction", Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", sysInstruction))
        ));
        bodyMap.put("contents", contents);
        bodyMap.put("generationConfig", Map.of(
                "temperature", 0.7,
                "topK", 40,
                "topP", 0.95,
                "maxOutputTokens", 1024
        ));

        try {
            String requestBody = objectMapper.writeValueAsString(bodyMap);
            HttpResponse<String> lastResponse = null;

            for (String model : GEMINI_MODELS) {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                        + model + ":generateContent?key=" + geminiApiKey;

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .timeout(Duration.ofSeconds(30))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                lastResponse = response;

                if (response.statusCode() == 200) {
                    JsonNode root = objectMapper.readTree(response.body());
                    String reply = root.path("candidates")
                            .path(0)
                            .path("content")
                            .path("parts")
                            .path(0)
                            .path("text")
                            .asText("");

                    if (reply == null || reply.isBlank()) {
                        reply = "I could not generate a response. Please try again.";
                    }
                    return ResponseEntity.ok(Map.of("reply", reply, "model", model));
                }

                if (response.statusCode() != 404) {
                    break;
                }
            }

            int status = lastResponse != null ? lastResponse.statusCode() : 502;
            String errMsg = "AI service error (HTTP " + status + ")";
            if (lastResponse != null && lastResponse.body() != null) {
                try {
                    JsonNode errNode = objectMapper.readTree(lastResponse.body());
                    String apiMsg = errNode.path("error").path("message").asText("");
                    if (!apiMsg.isBlank()) errMsg = apiMsg;
                } catch (Exception ignored) {}
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", errMsg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "AI request failed."));
        }
    }
}
