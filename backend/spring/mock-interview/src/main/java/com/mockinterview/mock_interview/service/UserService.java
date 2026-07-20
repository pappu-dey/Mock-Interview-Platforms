package com.mockinterview.mock_interview.service;

import com.mockinterview.mock_interview.dto.auth.LoginRequest;
import com.mockinterview.mock_interview.dto.auth.LoginResponse;
import com.mockinterview.mock_interview.dto.auth.RegisterRequest;
import com.mockinterview.mock_interview.dto.auth.RegisterResponse;

public interface UserService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

}