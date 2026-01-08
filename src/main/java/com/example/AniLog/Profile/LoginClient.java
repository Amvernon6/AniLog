package com.example.AniLog.Profile;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/login")
public class LoginClient {
    private final LoginService loginService;

    public LoginClient(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmailOrUsername() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Email/Username and password are required"));
        }
        LoginService.LoginResponse loginResponse = loginService.login(request.getEmailOrUsername().toLowerCase(), request.getPassword());
        if (loginResponse == null) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid email/username or password"));
        }
        return ResponseEntity.ok(loginResponse);
    }

    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    public static class LoginRequest {
        private String emailOrUsername;
        private String password;

        public String getEmailOrUsername() {
            return emailOrUsername;
        }

        public void setEmailOrUsername(String emailOrUsername) {
            this.emailOrUsername = emailOrUsername;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
