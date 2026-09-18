package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.dto.question.QuestionDto;
import com.mockinterview.mock_interview.entity.Question;
import com.mockinterview.mock_interview.repository.QuestionRepository;
import com.mockinterview.mock_interview.service.QuestionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionServiceImpl(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    private boolean matchesCategory(String qCategory, String filterCategory) {
        if (filterCategory == null || filterCategory.isBlank() || filterCategory.equalsIgnoreCase("All")) {
            return true;
        }
        if (qCategory == null) return false;
        String qc = qCategory.toLowerCase().trim();
        String fc = filterCategory.toLowerCase().trim();
        if (qc.equals(fc) || qc.contains(fc) || fc.contains(qc)) return true;
        if (fc.startsWith("quant") && qc.contains("quant")) return true;
        if (fc.startsWith("reason") && qc.contains("reason")) return true;
        if ((fc.startsWith("verb") || fc.startsWith("eng")) && (qc.contains("verb") || qc.contains("eng"))) return true;
        if (fc.startsWith("tech") && (qc.contains("tech") || qc.contains("java") || qc.contains("sql"))) return true;
        return false;
    }

    private boolean matchesSubCategory(Question q, String subCategory) {
        if (subCategory == null || subCategory.isBlank() || subCategory.equalsIgnoreCase("All")) {
            return true;
        }
        String sc = subCategory.toLowerCase().trim();
        if (q.getSubCategory() != null && (q.getSubCategory().toLowerCase().contains(sc) || sc.contains(q.getSubCategory().toLowerCase()))) {
            return true;
        }
        if (q.getQuestion() != null && q.getQuestion().toLowerCase().contains(sc)) {
            return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionDto> getAllQuestions(String category, String subCategory, String difficulty, String companyTag, String questionType) {
        List<Question> list = questionRepository.findAll();

        return list.stream()
                .filter(q -> matchesCategory(q.getCategory(), category))
                .filter(q -> matchesSubCategory(q, subCategory))
                .filter(q -> difficulty == null || difficulty.isBlank() || difficulty.equalsIgnoreCase("All") ||
                        (q.getDifficulty() != null && q.getDifficulty().equalsIgnoreCase(difficulty)))
                .filter(q -> companyTag == null || companyTag.isBlank() ||
                        (q.getCompanyTag() != null && q.getCompanyTag().toLowerCase().contains(companyTag.toLowerCase())))
                .filter(q -> questionType == null || questionType.isBlank() || questionType.equalsIgnoreCase("All") ||
                        (q.getQuestionType() != null && q.getQuestionType().equalsIgnoreCase(questionType)))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionDto> getRandomQuestions(String category, int limit) {
        List<Question> list = questionRepository.findAll();
        List<Question> filtered = list.stream()
                .filter(q -> matchesCategory(q.getCategory(), category))
                .collect(Collectors.toList());

        java.util.Collections.shuffle(filtered);

        if (limit > 0 && filtered.size() > limit) {
            filtered = filtered.subList(0, limit);
        }

        return filtered.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionDto getQuestionById(Long id) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        return mapToDto(q);
    }

    @Override
    public QuestionDto createQuestion(QuestionDto dto) {
        Question question = mapToEntity(dto);
        question.setId(null); // Ensure ID is generated
        Question saved = questionRepository.save(question);
        return mapToDto(saved);
    }

    @Override
    public QuestionDto updateQuestion(Long id, QuestionDto dto) {
        Question existing = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        existing.setQuestion(dto.getQuestion());
        existing.setOptionA(dto.getOptionA());
        existing.setOptionB(dto.getOptionB());
        existing.setOptionC(dto.getOptionC());
        existing.setOptionD(dto.getOptionD());
        existing.setAnswer(dto.getAnswer());
        existing.setCategory(dto.getCategory());
        existing.setSubCategory(dto.getSubCategory());
        existing.setQuestionType(dto.getQuestionType());
        existing.setDifficulty(dto.getDifficulty());
        existing.setExplanation(dto.getExplanation());
        existing.setCompanyTag(dto.getCompanyTag());

        Question updated = questionRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long countQuestions() {
        return questionRepository.count();
    }

    private QuestionDto mapToDto(Question q) {
        if (q == null) return null;
        return QuestionDto.builder()
                .id(q.getId())
                .question(q.getQuestion())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .answer(q.getAnswer())
                .category(q.getCategory())
                .subCategory(q.getSubCategory())
                .questionType(q.getQuestionType())
                .difficulty(q.getDifficulty())
                .explanation(q.getExplanation())
                .companyTag(q.getCompanyTag())
                .createdAt(q.getCreatedAt())
                .updatedAt(q.getUpdatedAt())
                .build();
    }

    private Question mapToEntity(QuestionDto dto) {
        if (dto == null) return null;
        return Question.builder()
                .id(dto.getId())
                .question(dto.getQuestion())
                .optionA(dto.getOptionA())
                .optionB(dto.getOptionB())
                .optionC(dto.getOptionC())
                .optionD(dto.getOptionD())
                .answer(dto.getAnswer())
                .category(dto.getCategory() != null ? dto.getCategory() : "General")
                .subCategory(dto.getSubCategory())
                .questionType(dto.getQuestionType() != null ? dto.getQuestionType() : "MCQ")
                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty() : "Medium")
                .explanation(dto.getExplanation())
                .companyTag(dto.getCompanyTag())
                .build();
    }
}

