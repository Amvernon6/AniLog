package com.example.AniLog.Profile;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LoginService {
    private final PostgreSQLUserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    
    public LoginService(PostgreSQLUserRepository userRepository, 
                       RefreshTokenRepository refreshTokenRepository,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public LoginResponse login(String entry, String password) {
        // Query the user by username
        User userByUsername = userRepository.findByUsername(entry).orElse(null);

        // Query the user by email
        User userByEmail = userRepository.findByEmailAddress(entry).orElse(null);

        // Determine which user to use
        User user = (userByUsername != null) ? userByUsername : userByEmail;

        // Check if user exists and password matches
        if (user != null && passwordEncoder.matches(password, user.getPasswordHash())) {
            // Generate tokens
            String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken(user.getId());
            
            // Delete old refresh tokens for this user
            refreshTokenRepository.deleteByUserId(user.getId());
            
            // Save new refresh token
            RefreshToken refreshTokenEntity = new RefreshToken(
                refreshToken,
                user.getId(),
                LocalDateTime.now().plusDays(7)
            );
            refreshTokenRepository.save(refreshTokenEntity);
            
            return new LoginResponse(accessToken, refreshToken, user.getId(), user.getUsername());
        }
        return null;
    }

    public static class LoginResponse {
        private String accessToken;
        private String refreshToken;
        private Long userId;
        private String username;

        public LoginResponse(String accessToken, String refreshToken, Long userId, String username) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.userId = userId;
            this.username = username;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getRefreshToken() {
            return refreshToken;
        }

        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
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
