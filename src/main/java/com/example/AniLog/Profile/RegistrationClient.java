package com.example.AniLog.Profile;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/register")
public class RegistrationClient {
    private final RegistrationService registrationService;

    public RegistrationClient(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<?> register(@RequestBody RegistrationRequest request) {
        // Validation
        if (request.getEmailAddress() == null || request.getEmailAddress().isBlank()) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Email address is required")
            );
        }

        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Username is required")  // 400
            );
        }
        
        String password = request.getPassword();
        if (password == null || password.length() < 8) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Password must be at least 8 characters")  // 400
            );
        }
        if (!password.matches(".*[A-Z].*")) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Password must contain at least one uppercase letter")
            );
        }
        if (!password.matches(".*[a-z].*")) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Password must contain at least one lowercase letter")
            );
        }
        if (!password.matches(".*[0-9].*")) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Password must contain at least one number")
            );
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Password must contain at least one special character (ex. !,@,#,$,%^,&,*, etc.)")
            );
        }
        
        try {
            User user = registrationService.register(
                request.getEmailAddress().toLowerCase(),
                request.getUsername(), 
                request.getPassword(), 
                request.getAge()
            );
            return ResponseEntity.status(201).body(
                new SuccessResponse("User registered successfully")  // 201
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse(e.getMessage())  // 400
            );
        } catch (Exception e) {
            return ResponseEntity.status(409).body(
                new ErrorResponse("Username already exists")  // 409 Conflict
            );
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Username is required")
            );
        }
        
        boolean existing = registrationService.userExists(username);
        
        if (existing) {
            return ResponseEntity.ok(
                new AvailabilityResponse(false, "Username already taken")
            );
        }
        
        return ResponseEntity.ok(
            new AvailabilityResponse(true, "Username available")
        );
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String emailAddress) {
        if (emailAddress == null || emailAddress.isBlank()) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Email address is required")
            );
        }
        
        boolean existing = registrationService.emailExists(emailAddress);
        
        if (existing) {
            return ResponseEntity.ok(
                new AvailabilityResponse(false, "Email address already taken")
            );
        }
        
        return ResponseEntity.ok(
            new AvailabilityResponse(true, "Email address available")
        );
    }

    public static class RegistrationRequest {
        private String emailAddress;
        private String username;
        private String password;
        private int age;

        public String getEmailAddress() {
            return emailAddress;
        }

        public void setEmailAddress(String emailAddress) {
            this.emailAddress = emailAddress;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public int getAge() {
            return age;
        }

        public void setAge(int age) {
            this.age = age;
        }
    }

    public class ErrorResponse {
    private final String error;
    
    public ErrorResponse(String error) {
        this.error = error;
    }
    
    public String getError() {
        return error;
    }
}

    public class SuccessResponse {
        private final String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    
    }

    public class AvailabilityResponse {
        private final boolean available;
        private final String message;
        
        public AvailabilityResponse(boolean available, String message) {
            this.available = available;
            this.message = message;
        }
        
        public boolean isAvailable() {
            return available;
        }
        
        public String getMessage() {
            return message;
        }
    }
}