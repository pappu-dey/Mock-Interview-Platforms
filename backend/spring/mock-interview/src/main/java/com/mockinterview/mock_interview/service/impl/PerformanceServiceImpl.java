package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.dto.performance.PerformanceDto;
import com.mockinterview.mock_interview.dto.performance.PerformanceDto.*;
import com.mockinterview.mock_interview.entity.Answer;
import com.mockinterview.mock_interview.entity.DailyActivity;
import com.mockinterview.mock_interview.entity.InterviewPerformance;
import com.mockinterview.mock_interview.entity.InterviewSession;
import com.mockinterview.mock_interview.entity.Question;
import com.mockinterview.mock_interview.entity.UserQuestionProgress;
import com.mockinterview.mock_interview.repository.*;
import com.mockinterview.mock_interview.service.PerformanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PerformanceServiceImpl implements PerformanceService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewPerformanceRepository performanceRepository;
    private final AnswerRepository answerRepository;
    private final DailyActivityRepository dailyActivityRepository;
    private final QuestionRepository questionRepository;
    private final UserQuestionProgressRepository userQuestionProgressRepository;

    public PerformanceServiceImpl(InterviewSessionRepository sessionRepository,
                                  InterviewPerformanceRepository performanceRepository,
                                  AnswerRepository answerRepository,
                                  DailyActivityRepository dailyActivityRepository,
                                  QuestionRepository questionRepository,
                                  UserQuestionProgressRepository userQuestionProgressRepository) {
        this.sessionRepository = sessionRepository;
        this.performanceRepository = performanceRepository;
        this.answerRepository = answerRepository;
        this.dailyActivityRepository = dailyActivityRepository;
        this.questionRepository = questionRepository;
        this.userQuestionProgressRepository = userQuestionProgressRepository;
    }

    @Override
    public PerformanceDto getPerformanceData(Integer userId) {
        List<InterviewSession> sessions =
                sessionRepository.findByUser_UserIdOrderByStartTimeDesc(userId);
        List<InterviewPerformance> performances =
                performanceRepository.findByUser_UserIdOrderBySession_StartTimeDesc(userId);
        List<Answer> answers = answerRepository.findBySession_User_UserId(userId);
        List<DailyActivity> allActivities = dailyActivityRepository.findByUser_UserIdOrderByActivityDateDesc(userId);
        List<UserQuestionProgress> progressList = userQuestionProgressRepository.findByUser_UserId(userId);

        // ── Question Attempted / Solved / Accuracy ───────────────────────
        int totalAttempted = progressList.size();
        int totalSolved = (int) progressList.stream()
                .filter(p -> "SOLVED".equalsIgnoreCase(p.getStatus()))
                .count();
        int totalQuestionsInBank = (int) questionRepository.count();

        // Accuracy across all submitted answers (or progress records if no answers)
        double accuracyPercentage = 0.0;
        if (!answers.isEmpty()) {
            long correctAnswers = answers.stream()
                    .filter(a -> a.getScore() != null && a.getScore() >= 50.0)
                    .count();
            accuracyPercentage = (correctAnswers * 100.0) / answers.size();
        } else if (totalAttempted > 0) {
            accuracyPercentage = (totalSolved * 100.0) / totalAttempted;
        }

        // ── KPIs ─────────────────────────────────────────────────────────
        int totalSessions = sessions.size();

        double averageScore = 0.0;
        if (!performances.isEmpty()) {
            averageScore = performances.stream()
                    .filter(p -> p.getOverallScore() != null)
                    .mapToDouble(InterviewPerformance::getOverallScore)
                    .average()
                    .orElse(0.0);
        } else if (!answers.isEmpty()) {
            averageScore = answers.stream()
                    .filter(a -> a.getScore() != null)
                    .mapToDouble(Answer::getScore)
                    .average()
                    .orElse(0.0);
        }

        LocalDate today = ActivityStatsCalculator.today();
        int currentStreak = ActivityStatsCalculator.computeCurrentStreak(allActivities, today);
        int longestStreak = ActivityStatsCalculator.computeLongestStreak(allActivities);
        int totalActiveDays = ActivityStatsCalculator.computeTotalActiveDays(allActivities);

        // ── Skill breakdown (batch-resolves categories without N+1) ──────
        List<SkillBreakdownItem> skillBreakdown = buildSkillBreakdown(answers);

        String bestCategory = "N/A";
        double bestCategoryScore = 0.0;
        int bestCategorySessions = 0;
        if (!skillBreakdown.isEmpty()) {
            SkillBreakdownItem best = skillBreakdown.stream()
                    .max(Comparator.comparingDouble(SkillBreakdownItem::getScore))
                    .orElse(null);
            if (best != null) {
                bestCategory = best.getLabel();
                bestCategoryScore = best.getScore();
                bestCategorySessions = best.getSessions();
            }
        }

        // ── Score trend (last 8 completed sessions, oldest first) ────────
        List<ScoreTrendItem> scoreTrend = buildScoreTrend(sessions);

        // ── Recent sessions (top 10) ─────────────────────────────────────
        List<RecentSessionItem> recentSessions = buildRecentSessions(sessions);

        // ── Strengths & improvements (derived from real records) ─────────
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();
        extractStrengthsAndImprovements(performances, skillBreakdown, strengths, improvements);

        // ── Weekly activity (28 days heatmap) ────────────────────────────
        List<Integer> weeklyActivity = buildWeeklyActivity(allActivities, today);

        // ── Placement readiness ──────────────────────────────────────────
        double placementReadiness = computePlacementReadiness(averageScore, totalSessions, totalSolved, currentStreak);

        return PerformanceDto.builder()
                .totalSessions(totalSessions)
                .averageScore(Math.round(averageScore * 10.0) / 10.0)
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalActiveDays(totalActiveDays)
                .totalAttempted(totalAttempted)
                .totalSolved(totalSolved)
                .totalQuestionsInBank(totalQuestionsInBank)
                .accuracyPercentage(Math.round(accuracyPercentage * 10.0) / 10.0)
                .bestCategory(bestCategory)
                .bestCategoryScore(Math.round(bestCategoryScore * 10.0) / 10.0)
                .bestCategorySessions(bestCategorySessions)
                .scoreTrend(scoreTrend)
                .skillBreakdown(skillBreakdown)
                .recentSessions(recentSessions)
                .strengths(strengths)
                .improvements(improvements)
                .weeklyActivity(weeklyActivity)
                .placementReadiness(Math.round(placementReadiness * 10.0) / 10.0)
                .build();
    }

    // ─── private helpers ─────────────────────────────────────────────────

    private List<ScoreTrendItem> buildScoreTrend(List<InterviewSession> sessions) {
        if (sessions == null || sessions.isEmpty()) {
            return List.of();
        }

        List<InterviewSession> completed = sessions.stream()
                .filter(s -> s.getOverallScore() != null)
                .limit(8)
                .collect(Collectors.toList());
        if (completed.isEmpty()) {
            return List.of();
        }
        Collections.reverse(completed);

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("MMM dd");
        List<ScoreTrendItem> trend = new ArrayList<>();
        for (int i = 0; i < completed.size(); i++) {
            InterviewSession s = completed.get(i);
            String dateStr = s.getStartTime() != null ? s.getStartTime().format(dateFmt) : "Session " + (i + 1);
            String topic = s.getRoleName() != null && !s.getRoleName().isBlank()
                    ? s.getRoleName()
                    : (s.getCompany() != null && !s.getCompany().isBlank() ? s.getCompany() : "Practice");
            trend.add(ScoreTrendItem.builder()
                    .session("S" + (i + 1))
                    .sessionLabel("Session " + (i + 1))
                    .score(Math.round(s.getOverallScore() * 10.0) / 10.0)
                    .date(dateStr)
                    .topic(topic)
                    .build());
        }
        return trend;
    }

    private List<SkillBreakdownItem> buildSkillBreakdown(List<Answer> answers) {
        if (answers == null || answers.isEmpty()) {
            return List.of();
        }

        // Batch-load any missing question categories in a single query (avoid N+1)
        Set<Long> missingQuestionIds = new HashSet<>();
        for (Answer answer : answers) {
            if ((answer.getCategory() == null || answer.getCategory().isBlank())
                    && (answer.getFeedback() == null || !answer.getFeedback().contains("|"))
                    && answer.getQuestionId() != null && answer.getQuestionId() > 0) {
                missingQuestionIds.add(Long.valueOf(answer.getQuestionId()));
            }
        }
        Map<Long, String> questionCategoryMap = new HashMap<>();
        if (!missingQuestionIds.isEmpty()) {
            for (Question q : questionRepository.findAllById(missingQuestionIds)) {
                if (q.getCategory() != null) {
                    questionCategoryMap.put(q.getId(), q.getCategory());
                }
            }
        }

        String[] colors = {"#5B4EE8", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"};
        Map<String, List<Double>> categoryScores = new LinkedHashMap<>();
        Map<String, Integer> categoryCount = new LinkedHashMap<>();

        for (Answer answer : answers) {
            String cat = answer.getCategory();
            if (cat == null || cat.isBlank()) {
                if (answer.getFeedback() != null && answer.getFeedback().contains("|")) {
                    cat = answer.getFeedback().split("\\|")[0].trim();
                } else if (answer.getQuestionId() != null && answer.getQuestionId() > 0) {
                    cat = questionCategoryMap.get(Long.valueOf(answer.getQuestionId()));
                }
            }
            if (cat != null && !cat.isBlank()) {
                categoryScores.computeIfAbsent(cat, k -> new ArrayList<>());
                if (answer.getScore() != null) {
                    categoryScores.get(cat).add(answer.getScore());
                }
                categoryCount.merge(cat, 1, Integer::sum);
            }
        }

        if (categoryScores.isEmpty()) {
            return List.of();
        }

        int idx = 0;
        List<SkillBreakdownItem> list = new ArrayList<>();
        for (Map.Entry<String, List<Double>> e : categoryScores.entrySet()) {
            double avg = e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            int count = categoryCount.getOrDefault(e.getKey(), 0);
            list.add(SkillBreakdownItem.builder()
                    .label(e.getKey())
                    .category(e.getKey())
                    .score(Math.round(avg * 10.0) / 10.0)
                    .sessions(count)
                    .totalQuestions(count)
                    .color(colors[idx % colors.length])
                    .build());
            idx++;
        }
        list.sort(Comparator.comparing(SkillBreakdownItem::getLabel));
        return list;
    }

    private List<RecentSessionItem> buildRecentSessions(List<InterviewSession> sessions) {
        if (sessions == null || sessions.isEmpty()) {
            return List.of();
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        List<RecentSessionItem> list = new ArrayList<>();
        int idCounter = 1;
        for (InterviewSession s : sessions.stream().limit(10).collect(Collectors.toList())) {
            double score = s.getOverallScore() != null ? s.getOverallScore() : 0.0;
            String topic = s.getCompany() != null && !s.getCompany().isBlank()
                    ? s.getCompany() + " " + (s.getRoleName() != null ? s.getRoleName() : "Interview")
                    : (s.getRoleName() != null && !s.getRoleName().isBlank() ? s.getRoleName() : "Practice Session");
            String roleName = s.getRoleName() != null && !s.getRoleName().isBlank()
                    ? s.getRoleName()
                    : (s.getCompany() != null ? s.getCompany() + " Candidate" : "Practice");

            String durationLabel = "—";
            if (s.getStartTime() != null && s.getEndTime() != null) {
                long mins = Math.max(1, Duration.between(s.getStartTime(), s.getEndTime()).toMinutes());
                durationLabel = mins + " min";
            }

            list.add(RecentSessionItem.builder()
                    .id(idCounter++)
                    .sessionId(s.getSessionId())
                    .topic(topic)
                    .date(s.getStartTime() != null ? s.getStartTime().format(fmt) : "Recent")
                    .score(Math.round(score * 10.0) / 10.0)
                    .overallScore(Math.round(score * 10.0) / 10.0)
                    .time(durationLabel)
                    .type(s.getCompany() != null && !s.getCompany().isBlank() ? "Mock" : "Practice")
                    .roleName(roleName)
                    .build());
        }
        return list;
    }

    private void extractStrengthsAndImprovements(List<InterviewPerformance> performances,
                                                  List<SkillBreakdownItem> skillBreakdown,
                                                  List<String> strengths,
                                                  List<String> improvements) {
        Set<String> sSet = new LinkedHashSet<>();
        Set<String> iSet = new LinkedHashSet<>();

        for (InterviewPerformance p : performances) {
            if (p.getStrengths() != null && !p.getStrengths().isBlank()) {
                Arrays.stream(p.getStrengths().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .forEach(sSet::add);
            }
            if (p.getImprovements() != null && !p.getImprovements().isBlank()) {
                Arrays.stream(p.getImprovements().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .forEach(iSet::add);
            }
        }

        for (SkillBreakdownItem item : skillBreakdown) {
            if (item.getScore() >= 75.0) {
                sSet.add("Strong accuracy in " + item.getLabel() + " (" + Math.round(item.getScore()) + "%)");
            } else {
                iSet.add("Needs more practice in " + item.getLabel() + " (" + Math.round(item.getScore()) + "%)");
            }
        }

        strengths.addAll(sSet);
        improvements.addAll(iSet);
    }

    private List<Integer> buildWeeklyActivity(List<DailyActivity> allActivities, LocalDate today) {
        LocalDate startDate = today.minusDays(27);
        Map<LocalDate, Integer> dateMap = new HashMap<>();

        if (allActivities != null) {
            for (DailyActivity a : allActivities) {
                if (a.getActivityDate() != null && !a.getActivityDate().isBefore(startDate) && !a.getActivityDate().isAfter(today)) {
                    int total = a.getTotalActivities() != null ? a.getTotalActivities() : 0;
                    if (total == 0) {
                        int solved = a.getQuestionsSolved() != null ? a.getQuestionsSolved() : 0;
                        int mocks = a.getMockTestsCompleted() != null ? a.getMockTestsCompleted()
                                : (a.getSessionsCount() != null ? a.getSessionsCount() : 0);
                        total = solved + mocks;
                    }
                    int level = total == 0 ? 0 : total <= 2 ? 1 : total <= 5 ? 2 : 3;
                    dateMap.put(a.getActivityDate(), level);
                }
            }
        }

        List<Integer> activity28 = new ArrayList<>(28);
        for (int i = 0; i < 28; i++) {
            activity28.add(dateMap.getOrDefault(startDate.plusDays(i), 0));
        }
        return activity28;
    }

    private double computePlacementReadiness(double averageScore, int totalSessions, int totalSolved, int streak) {
        if (totalSessions == 0 && totalSolved == 0) {
            return 0.0;
        }
        double scoreComponent = averageScore;
        double streakComponent = Math.min(streak, 30) / 30.0 * 100.0;
        double volumeComponent = Math.min(totalSessions + totalSolved, 50) / 50.0 * 100.0;
        return 0.4 * scoreComponent + 0.3 * streakComponent + 0.3 * volumeComponent;
    }
}
