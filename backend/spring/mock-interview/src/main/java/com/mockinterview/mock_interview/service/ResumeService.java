package com.mockinterview.mock_interview.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.mockinterview.mock_interview.dto.resume.ResumeDto;
import com.mockinterview.mock_interview.entity.Resume;
import com.mockinterview.mock_interview.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@Service
public class ResumeService {

    private final Cloudinary cloudinary;
    private final ResumeRepository resumeRepository;

    public ResumeService(
            Cloudinary cloudinary,
            ResumeRepository resumeRepository) {
        this.cloudinary = cloudinary;
        this.resumeRepository = resumeRepository;
    }

    public ResumeDto uploadResume(Integer userId, MultipartFile file) throws Exception {

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a resume file");
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null) {
            throw new RuntimeException("Invalid file");
        }

        String lowerName = fileName.toLowerCase();

        if (!lowerName.endsWith(".pdf") &&
                !lowerName.endsWith(".doc") &&
                !lowerName.endsWith(".docx")) {

            throw new RuntimeException("Only PDF, DOC and DOCX files are allowed");
        }

        // Upload to Cloudinary with auto resource type detection
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", "resumes"));

        String resumeUrl = uploadResult.get("secure_url").toString();

        // Check if user already has a resume
        Resume resume = resumeRepository
                .findByUserId(userId)
        
        .orElse(new Resume());

        resume.setUserId(userId);
        resume.setResumeUrl(resumeUrl);
        resume.setUploadDate(LocalDate.now());

        Resume saved = resumeRepository.save(resume);
        return mapToDto(saved);
    }

    public ResumeDto getResumeByUserId(Integer userId) {
        return resumeRepository.findByUserId(userId)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional
    public void deleteResumeByUserId(Integer userId) {
        resumeRepository.findByUserId(userId).ifPresent(resumeRepository::delete);
    }

    private ResumeDto mapToDto(Resume resume) {
        return new ResumeDto(
                resume.getResumeId(),
                resume.getUserId(),
                resume.getResumeUrl(),
                resume.getUploadDate()
        );
    }
}