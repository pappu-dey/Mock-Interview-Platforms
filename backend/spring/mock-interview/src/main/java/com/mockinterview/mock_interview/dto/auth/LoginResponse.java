package com.mockinterview.mock_interview.dto.auth;

public class LoginResponse {

    private String token;
    private String message;
    private String role;
    private String fullName;

    public LoginResponse(String token, String message, String role) {
        this(token, message, role, "");
    }

    public LoginResponse(String token, String message, String role, String fullName) {
        this.token = token;
        this.message = message;
        this.role = role;
        this.fullName = fullName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
