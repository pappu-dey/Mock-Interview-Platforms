package com.mockinterview.mock_interview.controller;

import com.mockinterview.mock_interview.dto.resume.ResumeDto;
import com.mockinterview.mock_interview.entity.User;
import com.mockinterview.mock_interview.repository.UserRepository;
import com.mockinterview.mock_interview.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    public ResumeController(ResumeService resumeService, UserRepository userRepository) {
        this.resumeService = resumeService;
        this.userRepository = userRepository;
    }

    /**
     * POST /api/resume/upload
     * Uploads a resume file to Cloudinary and saves the URL in MySQL for the authenticated user.
     */
    @PostMapping("/upload")
    public ResponseEntity<ResumeDto> uploadResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) throws Exception {

        Integer userId = resolveUserId(userDetails);
        ResumeDto response = resumeService.uploadResume(userId, file);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/resume
     * Retrieves the uploaded resume details for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<ResumeDto> getResume(
            @AuthenticationPrincipal UserDetails userDetails) {

        Integer userId = resolveUserId(userDetails);
        ResumeDto resume = resumeService.getResumeByUserId(userId);
        if (resume == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resume);
    }

    /**
     * DELETE /api/resume
     * Deletes the user's uploaded resume record.
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteResume(
            @AuthenticationPrincipal UserDetails userDetails) {

        Integer userId = resolveUserId(userDetails);
        resumeService.deleteResumeByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    private Integer resolveUserId(UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));
        return user.getUserId();
    }
}
