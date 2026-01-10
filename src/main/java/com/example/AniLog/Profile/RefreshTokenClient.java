package com.example.AniLog.Profile;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/refresh")
public class RefreshTokenClient {
    private final RefreshTokenService refreshTokenService;

    public RefreshTokenClient(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping
    public ResponseEntity<?> refreshAccessToken(@RequestBody RefreshTokenRequest request) {
        if (request.getRefreshToken() == null || request.getRefreshToken().isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Refresh token is required"));
        }

        RefreshTokenService.RefreshTokenResponse response = refreshTokenService.refreshAccessToken(request.getRefreshToken());
        
        if (response == null) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid or expired refresh token"));
        }

        return ResponseEntity.ok(response);
    }

    public static class RefreshTokenRequest {
        private String refreshToken;

        public String getRefreshToken() {
            return refreshToken;
        }

        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }
    }
}
