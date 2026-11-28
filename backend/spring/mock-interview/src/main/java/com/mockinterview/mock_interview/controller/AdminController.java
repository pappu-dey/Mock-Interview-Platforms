package com.mockinterview.mock_interview.controller;

import com.mockinterview.mock_interview.entity.InterviewSession;
import com.mockinterview.mock_interview.entity.Profile;
import com.mockinterview.mock_interview.entity.Role;
import com.mockinterview.mock_interview.entity.User;
import com.mockinterview.mock_interview.repository.CompanyRepository;
import com.mockinterview.mock_interview.repository.InterviewSessionRepository;
import com.mockinterview.mock_interview.repository.ProfileRepository;
import com.mockinterview.mock_interview.repository.QuestionRepository;
import com.mockinterview.mock_interview.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final InterviewSessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final CompanyRepository companyRepository;

    public AdminController(UserRepository userRepository,
                           ProfileRepository profileRepository,
                           InterviewSessionRepository sessionRepository,
                           QuestionRepository questionRepository,
                           CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.companyRepository = companyRepository;
    }

    @GetMapping("/dashboard")
    @Transactional
    public Map<String, Object> getDashboard() {
        List<User> users = userRepository.findAll();
        List<InterviewSession> sessions = sessionRepository.findAllByOrderByStartTimeDesc();
        Map<Integer, Profile> profiles = profileRepository.findAllByUser_UserIdIn(
                        users.stream().map(User::getUserId).toList())
                .stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getUserId(), profile -> profile, (a, b) -> a));

        List<Map<String, Object>> userRows = users.stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(user -> userRow(user, profiles.get(user.getUserId()), sessions))
                .toList();
        List<Map<String, Object>> sessionRows = sessions.stream().map(this::sessionRow).toList();
        long activeSessions = sessions.stream().filter(session -> session.getEndTime() == null).count();
        double averageScore = sessions.stream()
                .map(InterviewSession::getOverallScore)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", users.size());
        stats.put("students", users.stream().filter(user -> user.getRole() == Role.STUDENT).count());
        stats.put("activeUsers", users.stream().filter(user -> Boolean.TRUE.equals(user.getActive())).count());
        stats.put("companies", companyRepository.count());
        stats.put("totalSessions", sessions.size());
        stats.put("completedSessions", sessions.stream().filter(session -> session.getEndTime() != null).count());
        stats.put("activeSessions", activeSessions);
        stats.put("averageScore", Math.round(averageScore));
        stats.put("totalQuestions", questionRepository.count());
        stats.put("totalCompanies", companyRepository.count());

        List<Map<String, Object>> recentActivity = sessions.stream()
                .limit(8)
                .map(this::activityRow)
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("stats", stats);
        result.put("users", userRows);
        result.put("sessions", sessionRows);
        result.put("weeklyActivity", weeklyActivity(users, sessions));
        result.put("monthlyRegistrations", monthlyRegistrations(users));
        result.put("recentActivity", recentActivity);
        return result;
    }

    @PutMapping("/users/{userId}/status")
    @Transactional
    public Map<String, Object> updateUserStatus(@PathVariable Integer userId,
                                                 @RequestBody UserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getEmail().equalsIgnoreCase(currentEmail) && !request.active()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot deactivate your own account");
        }
        if (user.getRole() == Role.ADMIN && !request.active()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin accounts cannot be deactivated here");
        }

        user.setActive(request.active());
        userRepository.save(user);
        return Map.of("userId", user.getUserId(), "active", Boolean.TRUE.equals(user.getActive()));
    }

    private Map<String, Object> userRow(User user, Profile profile, List<InterviewSession> sessions) {
        List<InterviewSession> userSessions = sessions.stream()
                .filter(session -> session.getUser().getUserId().equals(user.getUserId()))
                .toList();
        double average = userSessions.stream()
                .map(InterviewSession::getOverallScore)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0);

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", user.getUserId());
        row.put("name", profile != null && profile.getFullName() != null && !profile.getFullName().isBlank()
                ? profile.getFullName() : user.getEmail());
        row.put("email", user.getEmail());
        row.put("role", user.getRole().name().toLowerCase(Locale.ROOT));
        row.put("active", Boolean.TRUE.equals(user.getActive()));
        row.put("joined", user.getCreatedAt());
        row.put("interviews", userSessions.size());
        row.put("score", Math.round(average));
        return row;
    }

    private Map<String, Object> sessionRow(InterviewSession session) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", session.getSessionId());
        row.put("user", session.getUser().getEmail());
        row.put("email", session.getUser().getEmail());
        row.put("topic", session.getRoleName() != null && !session.getRoleName().isBlank()
                ? session.getRoleName() : (session.getCompany() != null ? session.getCompany() : "Interview"));
        row.put("score", session.getOverallScore() == null ? 0 : Math.round(session.getOverallScore()));
        row.put("duration", session.getStartTime() != null && session.getEndTime() != null
                ? Duration.between(session.getStartTime(), session.getEndTime()).toMinutes() + " min" : "—");
        row.put("status", session.getEndTime() == null ? "active" : "completed");
        row.put("startTime", session.getStartTime());
        return row;
    }

    private Map<String, Object> activityRow(InterviewSession session) {
        Map<String, Object> row = new LinkedHashMap<>();
        String person = session.getUser().getEmail();
        String topic = session.getRoleName() != null && !session.getRoleName().isBlank()
                ? session.getRoleName() : "an interview";
        row.put("id", session.getSessionId());
        row.put("icon", session.getEndTime() == null ? "🎯" : "✅");
        row.put("color", session.getEndTime() == null ? "blue" : "green");
        row.put("text", person + (session.getEndTime() == null ? " started " : " completed ") + topic);
        row.put("time", session.getStartTime());
        return row;
    }

    private List<Map<String, Object>> weeklyActivity(List<User> users, List<InterviewSession> sessions) {
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> result = new ArrayList<>();
        for (int daysAgo = 6; daysAgo >= 0; daysAgo--) {
            LocalDate day = today.minusDays(daysAgo);
            long registrations = users.stream().filter(user -> user.getCreatedAt() != null
                    && user.getCreatedAt().toLocalDate().equals(day)).count();
            long interviews = sessions.stream().filter(session -> session.getStartTime() != null
                    && session.getStartTime().toLocalDate().equals(day)).count();
            result.add(Map.of(
                    "label", day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.getDefault()),
                    "users", registrations,
                    "interviews", interviews));
        }
        return result;
    }

    private List<Map<String, Object>> monthlyRegistrations(List<User> users) {
        YearMonth current = YearMonth.now();
        List<Map<String, Object>> result = new ArrayList<>();
        for (int monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
            YearMonth month = current.minusMonths(monthsAgo);
            long registrations = users.stream().filter(user -> user.getCreatedAt() != null
                    && YearMonth.from(user.getCreatedAt()).equals(month)).count();
            result.add(Map.of(
                    "label", month.getMonth().getDisplayName(TextStyle.SHORT, Locale.getDefault()),
                    "users", registrations));
        }
        return result;
    }

    public record UserStatusRequest(boolean active) {}
}
