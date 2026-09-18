package com.mockinterview.mock_interview.service;

import com.mockinterview.mock_interview.dto.question.QuestionDto;

import java.util.List;

public interface QuestionService {

    List<QuestionDto> getAllQuestions(String category, String subCategory, String difficulty, String companyTag, String questionType);

    List<QuestionDto> getRandomQuestions(String category, int limit);

    QuestionDto getQuestionById(Long id);

    QuestionDto createQuestion(QuestionDto questionDto);

    QuestionDto updateQuestion(Long id, QuestionDto questionDto);

    void deleteQuestion(Long id);

    long countQuestions();
}

