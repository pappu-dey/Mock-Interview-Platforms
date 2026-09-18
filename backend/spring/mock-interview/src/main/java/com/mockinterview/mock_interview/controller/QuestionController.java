package com.mockinterview.mock_interview.controller;

import com.mockinterview.mock_interview.dto.question.QuestionDto;
import com.mockinterview.mock_interview.service.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    /**
     * GET /api/questions
     * Retrieve all questions with optional filters: category, subCategory, difficulty, companyTag, questionType.
     */
    @GetMapping
    public ResponseEntity<List<QuestionDto>> getAllQuestions(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "subCategory", required = false) String subCategory,
            @RequestParam(value = "difficulty", required = false) String difficulty,
            @RequestParam(value = "companyTag", required = false) String companyTag,
            @RequestParam(value = "questionType", required = false) String questionType) {
        return ResponseEntity.ok(questionService.getAllQuestions(category, subCategory, difficulty, companyTag, questionType));
    }

    /**
     * GET /api/questions/random
     * Retrieve random questions filtered by category with optional limit.
     */
    @GetMapping("/random")
    public ResponseEntity<List<QuestionDto>> getRandomQuestions(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "limit", defaultValue = "25") int limit) {
        return ResponseEntity.ok(questionService.getRandomQuestions(category, limit));
    }

    /**
     * GET /api/questions/{id}
     * Retrieve a specific question by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuestionDto> getQuestionById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    /**
     * POST /api/questions
     * Add a new question to the database.
     */
    @PostMapping
    public ResponseEntity<QuestionDto> createQuestion(@RequestBody QuestionDto questionDto) {
        QuestionDto created = questionService.createQuestion(questionDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/questions/{id}
     * Update an existing question.
     */
    @PutMapping("/{id}")
    public ResponseEntity<QuestionDto> updateQuestion(
            @PathVariable("id") Long id,
            @RequestBody QuestionDto questionDto) {
        QuestionDto updated = questionService.updateQuestion(id, questionDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/questions/{id}
     * Delete a question by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable("id") Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}

