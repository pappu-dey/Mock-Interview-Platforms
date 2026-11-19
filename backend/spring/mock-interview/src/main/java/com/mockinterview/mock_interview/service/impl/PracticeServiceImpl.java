package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.dto.practice.ScheduleInterviewRequest;
import com.mockinterview.mock_interview.dto.practice.SubmitAnswerRequest;
import com.mockinterview.mock_interview.dto.practice.SubmitSessionRequest;
import com.mockinterview.mock_interview.entity.*;
import com.mockinterview.mock_interview.repository.*;
import com.mockinterview.mock_interview.service.PracticeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class PracticeServiceImpl implements PracticeService {

    private final UserRepository userRepository;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewPerformanceRepository performanceRepository;
    private final AnswerRepository answerRepository;
    private final DailyActivityRepository dailyActivityRepository;
    private final UserQuestionProgressRepository userQuestionProgressRepository;

    public PracticeServiceImpl(UserRepository userRepository,
                               InterviewSessionRepository sessionRepository,
                               InterviewPerformanceRepository performanceRepository,
                               AnswerRepository answerRepository,
                               DailyActivityRepository dailyActivityRepository,
                               UserQuestionProgressRepository userQuestionProgressRepository) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.performanceRepository = performanceRepository;
        this.answerRepository = answerRepository;
        this.dailyActivityRepository = dailyActivityRepository;
        this.userQuestionProgressRepository = userQuestionProgressRepository;
    }

    @Override
    public Map<String, Object> recordAnswer(Integer userId, SubmitAnswerRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // 1. Find or create an open practice session for today
        List<InterviewSession> openSessions = sessionRepository
                .findByUser_UserIdAndEndTimeIsNullOrderByStartTimeDesc(userId);

        InterviewSession session;
        if (!openSessions.isEmpty()) {
            session = openSessions.get(0);
        } else {
            session = InterviewSession.builder()
                    .user(user)
                    .startTime(LocalDateTime.now())
                    .overallScore(Boolean.TRUE.equals(request.getIsCorrect()) ? 100.0 : 0.0)
                    .build();
            session = sessionRepository.save(session);
        }

        // 2. Save the Answer
        double score = request.getScore() != null ? request.getScore()
                : (Boolean.TRUE.equals(request.getIsCorrect()) ? 100.0 : 0.0);

        Answer answer = Answer.builder()
                .session(session)
                .questionId(request.getQuestionId() != null ? request.getQuestionId().intValue() : 0)
                .answerText(request.getSelectedOption() != null ? request.getSelectedOption() : "Option")
                .score(score)
                .category(request.getCategory())
                .topic(request.getTopic())
                .feedback((request.getCategory() != null ? request.getCategory() : "General") + " | " +
                        (request.getTopic() != null ? request.getTopic() : "Topic"))
                .build();
        answerRepository.save(answer);

        // 3. Save or update UserQuestionProgress (marks question solved for this user)
        if (request.getQuestionId() != null) {
            Long qId = request.getQuestionId();
            UserQuestionProgress progress = userQuestionProgressRepository
                    .findByUser_UserIdAndQuestionId(userId, qId)
                    .orElseGet(() -> UserQuestionProgress.builder()
                            .user(user)
                            .questionId(qId)
                            .build());

            progress.setCategory(request.getCategory());
            progress.setTopic(request.getTopic());
            progress.setStatus("SOLVED");
            progress.setIsCorrect(Boolean.TRUE.equals(request.getIsCorrect()));
            progress.setSelectedOption(request.getSelectedOption());
            progress.setScore(score);
            progress.setSolvedAt(LocalDateTime.now());
            userQuestionProgressRepository.save(progress);
        }

        // 4. Update Daily Activity for today
        LocalDate today = LocalDate.now();
        DailyActivity activity = dailyActivityRepository
                .findByUser_UserIdAndActivityDate(userId, today)
                .orElseGet(() -> DailyActivity.builder()
                        .user(user)
                        .activityDate(today)
                        .sessionsCount(1)
                        .questionsSolved(0)
                        .build());

        int currentSolved = activity.getQuestionsSolved() != null ? activity.getQuestionsSolved() : 0;
        activity.setQuestionsSolved(currentSolved + 1);
        dailyActivityRepository.save(activity);

        // 5. Calculate total questions solved by this user
        long totalSolved = userQuestionProgressRepository.countByUser_UserId(userId);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("todayQuestionsSolved", activity.getQuestionsSolved());
        res.put("totalQuestionsSolved", totalSolved);
        res.put("category", request.getCategory());
        res.put("topic", request.getTopic());
        res.put("questionId", request.getQuestionId());
        res.put("isCorrect", request.getIsCorrect());

        return res;
    }

    @Override
    public Map<String, Object> recordSession(Integer userId, SubmitSessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        LocalDateTime now = LocalDateTime.now();
        int timeSpent = request.getTimeSpentSeconds() != null ? request.getTimeSpentSeconds() : 600;
        double overallScore = request.getScore() != null ? request.getScore() : 75.0;

        // 1. Save InterviewSession
        InterviewSession session = InterviewSession.builder()
                .user(user)
                .company(request.getCompany())
                .roleName(request.getRoleName() != null ? request.getRoleName() : (request.getTopic() != null ? request.getTopic() : "Practice"))
                .startTime(now.minusSeconds(timeSpent))
                .endTime(now)
                .overallScore(overallScore)
                .build();
        session = sessionRepository.save(session);

        // 2. Save Performance Record
        String strengths = "Consistent performance in " + (request.getCategory() != null ? request.getCategory() : "Practice");
        String improvements = overallScore >= 80
                ? "Target time-per-question optimization"
                : "Review fundamental concepts in " + (request.getTopic() != null ? request.getTopic() : "this topic");

        InterviewPerformance perf = InterviewPerformance.builder()
                .user(user)
                .session(session)
                .technicalScore(overallScore)
                .communicationScore(Math.min(100.0, overallScore + 4.0))
                .confidenceScore(Math.min(100.0, overallScore - 2.0))
                .overallScore(overallScore)
                .strengths(strengths)
                .improvements(improvements)
                .build();
        performanceRepository.save(perf);

        // 3. Update Daily Activity
        LocalDate today = LocalDate.now();
        DailyActivity activity = dailyActivityRepository
                .findByUser_UserIdAndActivityDate(userId, today)
                .orElseGet(() -> DailyActivity.builder()
                        .user(user)
                        .activityDate(today)
                        .sessionsCount(0)
                        .questionsSolved(0)
                        .build());

        int currentSessions = activity.getSessionsCount() != null ? activity.getSessionsCount() : 0;
        int currentSolved = activity.getQuestionsSolved() != null ? activity.getQuestionsSolved() : 0;
        int questionsToAdd = request.getTotalQuestions() != null ? request.getTotalQuestions() : 10;

        activity.setSessionsCount(currentSessions + 1);
        activity.setQuestionsSolved(currentSolved + questionsToAdd);
        dailyActivityRepository.save(activity);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("sessionId", session.getSessionId());
        res.put("overallScore", overallScore);
        res.put("totalSessionsToday", activity.getSessionsCount());
        res.put("totalQuestionsToday", activity.getQuestionsSolved());

        return res;
    }

    @Override
    public Map<String, Object> scheduleInterview(Integer userId, ScheduleInterviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        LocalDateTime startTime;
        if (request.getStartTime() != null && !request.getStartTime().isBlank()) {
            try {
                startTime = LocalDateTime.parse(request.getStartTime());
            } catch (Exception e) {
                startTime = LocalDateTime.now().plusHours(2);
            }
        } else {
            startTime = LocalDateTime.now().plusHours(2);
        }

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .company(request.getCompany())
                .roleName(request.getRole())
                .startTime(startTime)
                .build();
        session = sessionRepository.save(session);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("sessionId", session.getSessionId());
        res.put("company", request.getCompany());
        res.put("role", request.getRole());
        res.put("startTime", startTime.toString());

        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserProgress(Integer userId) {
        List<UserQuestionProgress> list = userQuestionProgressRepository.findByUser_UserId(userId);

        List<Long> solvedIds = new ArrayList<>();
        Map<String, Integer> topicCounts = new LinkedHashMap<>();
        Map<String, Integer> categoryCounts = new LinkedHashMap<>();
        Map<String, Object> questionDetails = new LinkedHashMap<>();

        for (UserQuestionProgress p : list) {
            solvedIds.add(p.getQuestionId());

            if (p.getTopic() != null && !p.getTopic().isBlank()) {
                topicCounts.merge(p.getTopic(), 1, Integer::sum);
            }
            if (p.getCategory() != null && !p.getCategory().isBlank()) {
                categoryCounts.merge(p.getCategory(), 1, Integer::sum);
            }

            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("status", p.getStatus());
            detail.put("isCorrect", p.getIsCorrect());
            detail.put("selectedOption", p.getSelectedOption());
            detail.put("score", p.getScore());
            detail.put("solvedAt", p.getSolvedAt() != null ? p.getSolvedAt().toString() : null);
            questionDetails.put(String.valueOf(p.getQuestionId()), detail);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("solvedQuestionIds", solvedIds);
        res.put("topicCounts", topicCounts);
        res.put("categoryCounts", categoryCounts);
        res.put("questionDetails", questionDetails);
        res.put("totalSolved", list.size());
        return res;
    }
}
