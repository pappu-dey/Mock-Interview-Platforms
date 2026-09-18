package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCategoryIgnoreCase(String category);

    List<Question> findByCategoryIgnoreCaseAndSubCategoryIgnoreCase(String category, String subCategory);

    List<Question> findByDifficultyIgnoreCase(String difficulty);

    List<Question> findByQuestionTypeIgnoreCase(String questionType);

    List<Question> findByCompanyTagContainingIgnoreCase(String companyTag);
}

