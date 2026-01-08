package com.example.AniLog.Profile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

class LoginServiceTest {

    private LoginService loginService;

    @Mock
    private PostgreSQLUserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtUtil jwtUtil;

    // No need to mock PasswordEncoder; tests use a real BCrypt instance per case

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        MockitoAnnotations.openMocks(this);
        loginService = new LoginService(userRepository, refreshTokenRepository, jwtUtil);
    }

    @Test
    @SuppressWarnings("null")
    void testLogin_SuccessWithUsername() {
        // Arrange
        String username = "testuser";
        String password = "TestPassword123!";
        String hashedPassword = "$2a$10$hashedPassword";
        
        User mockUser = createMockUser(1L, username, "test@example.com", hashedPassword);
        
        when(userRepository.findByUsername(username)).thenReturn(mockUser);
        when(userRepository.findByEmailAddress(username)).thenReturn(null);
        when(jwtUtil.generateAccessToken(anyLong(), anyString())).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(anyLong())).thenReturn("refresh-token");

        // Use a real PasswordEncoder for testing
        PasswordEncoder realEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String realHashedPassword = realEncoder.encode(password);
        mockUser.setPasswordHash(realHashedPassword);

        // Act
        LoginService serviceWithRealEncoder = new LoginService(userRepository, refreshTokenRepository, jwtUtil);
        LoginService.LoginResponse response = serviceWithRealEncoder.login(username, password);

        // Assert
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(1L, response.getUserId());
        verify(refreshTokenRepository).deleteByUserId(1L);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void testLogin_SuccessWithEmail() {
        // Arrange
        String email = "test@example.com";
        String password = "TestPassword123!";
        
        User mockUser = createMockUser(2L, "testuser", email, "hashedPassword");
        
        when(userRepository.findByUsername(email)).thenReturn(null);
        when(userRepository.findByEmailAddress(email)).thenReturn(mockUser);
        when(jwtUtil.generateAccessToken(anyLong(), anyString())).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(anyLong())).thenReturn("refresh-token");

        // Use a real PasswordEncoder
        PasswordEncoder realEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String realHashedPassword = realEncoder.encode(password);
        mockUser.setPasswordHash(realHashedPassword);

        // Act
        LoginService serviceWithRealEncoder = new LoginService(userRepository, refreshTokenRepository, jwtUtil);
        LoginService.LoginResponse response = serviceWithRealEncoder.login(email, password);

        // Assert
        assertNotNull(response);
        assertEquals(2L, response.getUserId());
        verify(refreshTokenRepository).deleteByUserId(2L);
    }

    @Test
    @SuppressWarnings("null")
    void testLogin_UserNotFound() {
        // Arrange
        when(userRepository.findByUsername(anyString())).thenReturn(null);
        when(userRepository.findByEmailAddress(anyString())).thenReturn(null);

        // Act
        LoginService.LoginResponse response = loginService.login("nonexistent", "password");

        // Assert
        assertNull(response);
        verify(refreshTokenRepository, never()).deleteByUserId(anyLong());
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }

    @Test
    @SuppressWarnings("null")
    void testLogin_WrongPassword() {
        // Arrange
        String username = "testuser";
        User mockUser = createMockUser(1L, username, "test@example.com", "hashedPassword");
        
        when(userRepository.findByUsername(username)).thenReturn(mockUser);
        
        // Use real password encoder
        PasswordEncoder realEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        mockUser.setPasswordHash(realEncoder.encode("correctPassword"));

        // Act
        LoginService serviceWithRealEncoder = new LoginService(userRepository, refreshTokenRepository, jwtUtil);
        LoginService.LoginResponse response = serviceWithRealEncoder.login(username, "wrongPassword");

        // Assert
        assertNull(response);
        verify(refreshTokenRepository, never()).deleteByUserId(anyLong());
    }

    @Test
    void testLogin_DeletesOldRefreshTokens() {
        // Arrange
        String username = "testuser";
        String password = "TestPassword123!";
        
        User mockUser = createMockUser(1L, username, "test@example.com", "hashedPassword");
        
        when(userRepository.findByUsername(username)).thenReturn(mockUser);
        when(jwtUtil.generateAccessToken(anyLong(), anyString())).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(anyLong())).thenReturn("refresh-token");

        PasswordEncoder realEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        mockUser.setPasswordHash(realEncoder.encode(password));

        // Act
        LoginService serviceWithRealEncoder = new LoginService(userRepository, refreshTokenRepository, jwtUtil);
        serviceWithRealEncoder.login(username, password);

        // Assert
        verify(refreshTokenRepository).deleteByUserId(1L);
    }

    @Test
    @SuppressWarnings("null")
    void testLogin_SavesNewRefreshToken() {
        // Arrange
        String username = "testuser";
        String password = "TestPassword123!";
        
        User mockUser = createMockUser(1L, username, "test@example.com", "hashedPassword");
        
        when(userRepository.findByUsername(username)).thenReturn(mockUser);
        when(jwtUtil.generateAccessToken(anyLong(), anyString())).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(anyLong())).thenReturn("refresh-token-value");

        PasswordEncoder realEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        mockUser.setPasswordHash(realEncoder.encode(password));

        // Act
        LoginService serviceWithRealEncoder = new LoginService(userRepository, refreshTokenRepository, jwtUtil);
        serviceWithRealEncoder.login(username, password);

        // Assert
        verify(refreshTokenRepository).save(argThat((RefreshToken token) -> 
            token != null &&
            "refresh-token-value".equals(token.getToken()) &&
            Long.valueOf(1L).equals(token.getUserId())
        ));
    }

    @Test
    void testLoginResponse_GettersAndSetters() {
        // Act
        LoginService.LoginResponse response = new LoginService.LoginResponse(
            "access-token", "refresh-token", 123L, "user1"
        );

        // Assert
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(123L, response.getUserId());
    }

    // Helper method
    private User createMockUser(Long id, String username, String email, String passwordHash) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmailAddress(email);
        user.setPasswordHash(passwordHash);
        return user;
    }
}
