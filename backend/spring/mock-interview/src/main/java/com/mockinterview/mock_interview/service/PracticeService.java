package com.mockinterview.mock_interview.service;

import com.mockinterview.mock_interview.dto.practice.ScheduleInterviewRequest;
import com.mockinterview.mock_interview.dto.practice.SubmitAnswerRequest;
import com.mockinterview.mock_interview.dto.practice.SubmitSessionRequest;

import java.util.Map;

public interface PracticeService {

    Map<String, Object> recordAnswer(Integer userId, SubmitAnswerRequest request);

    Map<String, Object> recordSession(Integer userId, SubmitSessionRequest request);

    Map<String, Object> scheduleInterview(Integer userId, ScheduleInterviewRequest request);

    Map<String, Object> getUserProgress(Integer userId);
}
