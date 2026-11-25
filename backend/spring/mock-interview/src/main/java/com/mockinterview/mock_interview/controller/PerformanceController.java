package com.mockinterview.mock_interview.controller;

import com.mockinterview.mock_interview.dto.performance.PerformanceDto;
import com.mockinterview.mock_interview.entity.User;
import com.mockinterview.mock_interview.repository.UserRepository;
import com.mockinterview.mock_interview.service.PerformanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PerformanceController {

    private final PerformanceService performanceService;
    private final UserRepository userRepository;

    public PerformanceController(PerformanceService performanceService,
                                 UserRepository userRepository) {
        this.performanceService = performanceService;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/performance
     * Returns the full performance data for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<PerformanceDto> getPerformance() {
        Integer userId = resolveUserId();
        return ResponseEntity.ok(performanceService.getPerformanceData(userId));
    }

    /**
     * GET /api/performance/sessions
     * Returns recent sessions for the authenticated user.
     */
    @GetMapping("/sessions")
    public ResponseEntity<?> getRecentSessions() {
        Integer userId = resolveUserId();
        PerformanceDto data = performanceService.getPerformanceData(userId);
        return ResponseEntity.ok(data.getRecentSessions());
    }

    /**
     * GET /api/performance/skills
     * Returns skill breakdown for the authenticated user.
     */
    @GetMapping("/skills")
    public ResponseEntity<?> getSkillBreakdown() {
        Integer userId = resolveUserId();
        PerformanceDto data = performanceService.getPerformanceData(userId);
        return ResponseEntity.ok(data.getSkillBreakdown());
    }

    // ─── helper ──────────────────────────────────────────────────────────────
    private Integer resolveUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            String email = auth.getName();
            return userRepository.findByEmail(email)
                    .map(User::getUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }
}
