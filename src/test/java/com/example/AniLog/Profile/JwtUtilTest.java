package com.example.AniLog.Profile;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Claims;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String testSecret = "ThisIsATestSecretKeyForJwtThatIsAtLeast256BitsLong12345678";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(testSecret);
    }

    @Test
    void testGenerateAccessToken() {
        // Arrange
        Long userId = 123L;
        String username = "testuser";

        // Act
        String token = jwtUtil.generateAccessToken(userId, username);

        // Assert
        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void testGenerateRefreshToken() {
        // Arrange
        Long userId = 456L;

        // Act
        String token = jwtUtil.generateRefreshToken(userId);

        // Assert
        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void testValidateToken_ValidAccessToken() {
        // Arrange
        Long userId = 789L;
        String username = "validuser";
        String token = jwtUtil.generateAccessToken(userId, username);

        // Act
        Claims claims = jwtUtil.validateToken(token);

        // Assert
        assertNotNull(claims);
        assertEquals(userId.toString(), claims.getSubject());
        assertEquals(username, claims.get("username"));
    }

    @Test
    void testValidateToken_ValidRefreshToken() {
        // Arrange
        Long userId = 321L;
        String token = jwtUtil.generateRefreshToken(userId);

        // Act
        Claims claims = jwtUtil.validateToken(token);

        // Assert
        assertNotNull(claims);
        assertEquals(userId.toString(), claims.getSubject());
    }

    @Test
    void testValidateToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.jwt.token";

        // Act
        Claims claims = jwtUtil.validateToken(invalidToken);

        // Assert
        assertNull(claims);
    }

    @Test
    void testValidateToken_MalformedToken() {
        // Arrange
        String malformedToken = "not-a-jwt";

        // Act
        Claims claims = jwtUtil.validateToken(malformedToken);

        // Assert
        assertNull(claims);
    }

    @Test
    void testGetUserIdFromToken_ValidToken() {
        // Arrange
        Long userId = 999L;
        String username = "testuser";
        String token = jwtUtil.generateAccessToken(userId, username);

        // Act
        Long extractedUserId = jwtUtil.getUserIdFromToken(token);

        // Assert
        assertNotNull(extractedUserId);
        assertEquals(userId, extractedUserId);
    }

    @Test
    void testGetUserIdFromToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.token";

        // Act
        Long userId = jwtUtil.getUserIdFromToken(invalidToken);

        // Assert
        assertNull(userId);
    }

    @Test
    void testIsTokenExpired_ValidToken() {
        // Arrange
        Long userId = 111L;
        String token = jwtUtil.generateAccessToken(userId, "user");

        // Act
        boolean isExpired = jwtUtil.isTokenExpired(token);

        // Assert
        assertFalse(isExpired);
    }

    @Test
    void testIsTokenExpired_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.token";

        // Act
        boolean isExpired = jwtUtil.isTokenExpired(invalidToken);

        // Assert
        assertTrue(isExpired); // Invalid tokens should be considered expired
    }

    @Test
    void testAccessToken_ContainsUsername() {
        // Arrange
        Long userId = 222L;
        String username = "specificuser";
        String token = jwtUtil.generateAccessToken(userId, username);

        // Act
        Claims claims = jwtUtil.validateToken(token);

        // Assert
        assertNotNull(claims);
        assertEquals(username, claims.get("username"));
    }

    @Test
    void testRefreshToken_DoesNotContainUsername() {
        // Arrange
        Long userId = 333L;
        String token = jwtUtil.generateRefreshToken(userId);

        // Act
        Claims claims = jwtUtil.validateToken(token);

        // Assert
        assertNotNull(claims);
        assertNull(claims.get("username"));
    }

    @Test
    void testToken_ContainsIssuedAt() {
        // Arrange
        Long userId = 444L;
        String token = jwtUtil.generateAccessToken(userId, "user");

        // Act
        Claims claims = jwtUtil.validateToken(token);

        // Assert
        assertNotNull(claims);
        assertNotNull(claims.getIssuedAt());
        assertTrue(claims.getIssuedAt().before(new Date()) || 
                   claims.getIssuedAt().equals(new Date()));
    }

    @Test
    void testToken_ContainsExpiration() {
        // Arrange
        Long userId = 555L;
        String token = jwtUtil.generateAccessToken(userId, "user");

        // Act
        Claims claims = jwtUtil.validateToken(token);

        // Assert
        assertNotNull(claims);
        assertNotNull(claims.getExpiration());
        assertTrue(claims.getExpiration().after(new Date()));
    }

    @Test
    void testDifferentTokensForSameUser() {
        // Arrange
        Long userId = 666L;
        String username = "sameuser";

        // Act
        String token1 = jwtUtil.generateAccessToken(userId, username);

        // Delay to ensure different second-precision timestamps (JWT uses seconds, not milliseconds)
        try {
            Thread.sleep(1001);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        String token2 = jwtUtil.generateAccessToken(userId, username);

        // Assert
        assertNotEquals(token1, token2); // Tokens should be different due to different timestamps
    }

    @Test
    void testAccessToken_SubjectIsUserId() {
        // Arrange
        Long userId = 777L;
        String username = "testuser";
        String token = jwtUtil.generateAccessToken(userId, username);

        // Act
        Claims claims = jwtUtil.validateToken(token);

        // Assert
        assertEquals(userId.toString(), claims.getSubject());
    }

    @Test
    void testGetUserIdFromToken_ParsesCorrectly() {
        // Arrange
        Long originalUserId = 888L;
        String token = jwtUtil.generateRefreshToken(originalUserId);

        // Act
        Long extractedUserId = jwtUtil.getUserIdFromToken(token);

        // Assert
        assertEquals(originalUserId, extractedUserId);
    }
}
