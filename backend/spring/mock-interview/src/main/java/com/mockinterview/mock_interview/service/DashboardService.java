package com.mockinterview.mock_interview.service;

import com.mockinterview.mock_interview.dto.dashboard.DashboardStatsDto;

public interface DashboardService {

    DashboardStatsDto getDashboardStats(Integer userId);
}
