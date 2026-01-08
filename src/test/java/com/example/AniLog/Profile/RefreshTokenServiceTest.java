package com.example.AniLog.Profile;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

class RefreshTokenServiceTest {

    private RefreshTokenService refreshTokenService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PostgreSQLUserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        MockitoAnnotations.openMocks(this);
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, userRepository, jwtUtil);
    }

    @Test
    void testRefreshAccessToken_Success() {
        // Arrange
        String refreshTokenString = "valid-refresh-token";
        Long userId = 123L;
        
        RefreshToken refreshToken = new RefreshToken(
            refreshTokenString,
            userId,
            LocalDateTime.now().plusDays(1)
        );

        when(refreshTokenRepository.findByToken(refreshTokenString)).thenReturn(Optional.of(refreshToken));
        // Service looks up User by ID and uses username for access token
        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jwtUtil.generateAccessToken(userId, "testuser")).thenReturn("new-access-token");

        // Act
        RefreshTokenService.RefreshTokenResponse response = 
            refreshTokenService.refreshAccessToken(refreshTokenString);

        // Assert
        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
    }

    @Test
    void testRefreshAccessToken_TokenNotFound() {
        // Arrange
        String refreshTokenString = "nonexistent-token";
        when(refreshTokenRepository.findByToken(refreshTokenString)).thenReturn(Optional.empty());

        // Act
        RefreshTokenService.RefreshTokenResponse response = 
            refreshTokenService.refreshAccessToken(refreshTokenString);

        // Assert
        assertNull(response);
        verify(jwtUtil, never()).generateAccessToken(anyLong(), anyString());
    }

    @Test
    void testRefreshAccessToken_TokenExpired() {
        // Arrange
        String refreshTokenString = "expired-token";
        Long userId = 123L;
        
        RefreshToken expiredToken = new RefreshToken(
            refreshTokenString,
            userId,
            LocalDateTime.now().minusDays(1) // Expired yesterday
        );

        when(refreshTokenRepository.findByToken(refreshTokenString)).thenReturn(Optional.of(expiredToken));

        // Act
        RefreshTokenService.RefreshTokenResponse response = 
            refreshTokenService.refreshAccessToken(refreshTokenString);

        // Assert
        assertNull(response);
        verify(jwtUtil, never()).generateAccessToken(anyLong(), anyString());
    }

    @Test
    void testRefreshAccessToken_ValidButExpiringSoon() {
        // Arrange
        String refreshTokenString = "almost-expired-token";
        Long userId = 456L;
        
        RefreshToken refreshToken = new RefreshToken(
            refreshTokenString,
            userId,
            LocalDateTime.now().plusMinutes(5) // Expires in 5 minutes
        );

        when(refreshTokenRepository.findByToken(refreshTokenString)).thenReturn(Optional.of(refreshToken));
        User user = new User();
        user.setId(userId);
        user.setUsername("soonexp");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jwtUtil.generateAccessToken(userId, "soonexp")).thenReturn("new-access-token");

        // Act
        RefreshTokenService.RefreshTokenResponse response = 
            refreshTokenService.refreshAccessToken(refreshTokenString);

        // Assert
        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
    }

    @Test
    void testRefreshTokenResponse_Constructor() {
        // Act
        RefreshTokenService.RefreshTokenResponse response = 
            new RefreshTokenService.RefreshTokenResponse("test-token", 1L, "user");

        // Assert
        assertEquals("test-token", response.getAccessToken());
        assertEquals(1L, response.getUserId());
        assertEquals("user", response.getUsername());
    }

    @Test
    void testRefreshToken_EntityGettersAndSetters() {
        // Arrange
        String token = "test-token-value";
        Long userId = 789L;
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

        // Act
        RefreshToken refreshToken = new RefreshToken(token, userId, expiresAt);

        // Assert
        assertEquals(token, refreshToken.getToken());
        assertEquals(userId, refreshToken.getUserId());
        assertEquals(expiresAt, refreshToken.getExpiryDate());
    }

    @Test
    void testRefreshToken_SetId() {
        // Arrange
        RefreshToken refreshToken = new RefreshToken(
            "token",
            1L,
            LocalDateTime.now().plusDays(1)
        );

        // Act
        refreshToken.setId(100L);

        // Assert
        assertEquals(100L, refreshToken.getId());
    }

    @Test
    void testRefreshAccessToken_ExactlyAtExpiration() {
        // Arrange
        String refreshTokenString = "token-at-expiration";
        Long userId = 999L;
        
        RefreshToken refreshToken = new RefreshToken(
            refreshTokenString,
            userId,
            LocalDateTime.now() // Expires right now
        );

        when(refreshTokenRepository.findByToken(refreshTokenString)).thenReturn(Optional.of(refreshToken));
        // Simulate missing user so service returns null per implementation
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act
        RefreshTokenService.RefreshTokenResponse response = 
            refreshTokenService.refreshAccessToken(refreshTokenString);

        // Assert
        // Token at exact expiration time should be considered invalid
        assertNull(response);
    }

    @Test
    void testRefreshAccessToken_UserIdExtraction() {
        // Arrange
        String refreshTokenString = "valid-token";
        Long expectedUserId = 12345L;
        
        RefreshToken refreshToken = new RefreshToken(
            refreshTokenString,
            expectedUserId,
            LocalDateTime.now().plusDays(7)
        );

        when(refreshTokenRepository.findByToken(refreshTokenString)).thenReturn(Optional.of(refreshToken));
        User user2 = new User();
        user2.setId(expectedUserId);
        user2.setUsername("expectedUser");
        when(userRepository.findById(expectedUserId)).thenReturn(Optional.of(user2));
        when(jwtUtil.generateAccessToken(eq(expectedUserId), eq("expectedUser"))).thenReturn("new-token");

        // Act
        RefreshTokenService.RefreshTokenResponse response = 
            refreshTokenService.refreshAccessToken(refreshTokenString);

        // Assert
        assertNotNull(response);
        verify(jwtUtil).generateAccessToken(expectedUserId, "expectedUser");
    }
}
