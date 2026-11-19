package com.mockinterview.mock_interview.service;

import com.mockinterview.mock_interview.dto.performance.PerformanceDto;

public interface PerformanceService {

    PerformanceDto getPerformanceData(Integer userId);
}
