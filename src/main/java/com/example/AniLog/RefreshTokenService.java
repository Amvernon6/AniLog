package com.example.AniLog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final PostgreSQLUserRepository userRepository;
    private final JwtUtil jwtUtil;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               PostgreSQLUserRepository userRepository,
                               JwtUtil jwtUtil) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public RefreshTokenResponse refreshAccessToken(String refreshToken) {
        // Find the refresh token in database
        Optional<RefreshToken> storedToken = refreshTokenRepository.findByToken(refreshToken);
        
        if (storedToken.isEmpty()) {
            return null; // Token not found
        }

        RefreshToken token = storedToken.get();

        // Check if token is expired
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            return null; // Token expired
        }

        // Get user associated with this token
        Optional<User> userOptional = userRepository.findById(token.getUserId());
        if (userOptional.isEmpty()) {
            return null; // User not found
        }
        User user = userOptional.get();

        // Generate new access token
        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());

        return new RefreshTokenResponse(newAccessToken, user.getId(), user.getUsername());
    }

    @Transactional
    public void revokeRefreshToken(String refreshToken) {
        Optional<RefreshToken> token = refreshTokenRepository.findByToken(refreshToken);
        token.ifPresent(refreshTokenRepository::delete);
    }

    public static class RefreshTokenResponse {
        private String accessToken;
        private Long userId;
        private String username;

        public RefreshTokenResponse(String accessToken, Long userId, String username) {
            this.accessToken = accessToken;
            this.userId = userId;
            this.username = username;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }
}
