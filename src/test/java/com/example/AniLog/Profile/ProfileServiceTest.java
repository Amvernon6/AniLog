package com.example.AniLog.Profile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

class ProfileServiceTest {

    private ProfileService profileService;

    @Mock
    private PostgreSQLUserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        profileService = new ProfileService(userRepository);
    }

    @Test
    void testGetProfile_Success() {
        // Arrange
        long userId = 1L;
        User mockUser = createMockUser(userId);

        when(userRepository.findById(userId)).thenReturn(mockUser);

        // Act
        User result = profileService.getProfile(userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("testuser", result.getUsername());
        verify(userRepository).findById(userId);
    }

    @Test
    void testGetProfile_UserNotFound() {
        // Arrange
        long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(null);

        // Act
        User result = profileService.getProfile(userId);

        // Assert
        assertNull(result);
    }

    @Test
    void testUpdateProfile_Success() {
        // Arrange
        long userId = 1L;
        User existingUser = createMockUser(userId);
        
        ProfileClient.ProfileUpdateRequest request = new ProfileClient.ProfileUpdateRequest();
        request.setBio("Updated bio");
        request.setAvatarUrl("https://example.com/new-avatar.jpg");
        request.setFavoriteAnime("New Anime");

        when(userRepository.findById(userId)).thenReturn(existingUser);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = profileService.updateProfile(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals("Updated bio", result.getBio());
        assertEquals("https://example.com/new-avatar.jpg", result.getAvatarUrl());
        assertEquals("New Anime", result.getFavoriteAnime());
        verify(userRepository).save(existingUser);
    }

    @Test
    void testUpdateProfile_UserNotFound() {
        // Arrange
        long userId = 999L;
        ProfileClient.ProfileUpdateRequest request = new ProfileClient.ProfileUpdateRequest();
        request.setBio("Updated bio");

        when(userRepository.findById(userId)).thenReturn(null);

        // Act
        User result = profileService.updateProfile(userId, request);

        // Assert
        assertNull(result);
        verify(userRepository, never()).save(any());
    }

    @Test
    void testUpdateProfile_AllFields() {
        // Arrange
        long userId = 1L;
        User existingUser = createMockUser(userId);
        
        ProfileClient.ProfileUpdateRequest request = new ProfileClient.ProfileUpdateRequest();
        request.setBio("New bio");
        request.setAvatarUrl("https://example.com/avatar.jpg");
        request.setEmailAddress("newemail@example.com");
        request.setUsername("newusername");
        request.setFavoriteAnime("Attack on Titan");
        request.setFavoriteGenre("Action, Drama");
        request.setFavoriteManga("One Piece");
        request.setAge(30);

        when(userRepository.findById(userId)).thenReturn(existingUser);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = profileService.updateProfile(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals("New bio", result.getBio());
        assertEquals("https://example.com/avatar.jpg", result.getAvatarUrl());
        assertEquals("newemail@example.com", result.getEmailAddress());
        assertEquals("newusername", result.getUsername());
        assertEquals("Attack on Titan", result.getFavoriteAnime());
        assertEquals("Action, Drama", result.getFavoriteGenre());
        assertEquals("One Piece", result.getFavoriteManga());
        assertEquals(30, result.getAge());
    }

    @Test
    void testUpdateProfile_PartialUpdate() {
        // Arrange
        long userId = 1L;
        User existingUser = createMockUser(userId);
        existingUser.setBio("Original bio");
        existingUser.setFavoriteAnime("Original anime");
        
        ProfileClient.ProfileUpdateRequest request = new ProfileClient.ProfileUpdateRequest();
        request.setBio("Updated bio");
        // Other fields are null

        when(userRepository.findById(userId)).thenReturn(existingUser);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = profileService.updateProfile(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals("Updated bio", result.getBio());
        assertEquals("Original anime", result.getFavoriteAnime()); // Should remain unchanged
    }

    @Test
    void testUpdateProfile_NullValues() {
        // Arrange
        long userId = 1L;
        User existingUser = createMockUser(userId);
        existingUser.setBio("Original bio");
        existingUser.setAvatarUrl("https://example.com/original.jpg");
        
        ProfileClient.ProfileUpdateRequest request = new ProfileClient.ProfileUpdateRequest();
        // All fields are null

        when(userRepository.findById(userId)).thenReturn(existingUser);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = profileService.updateProfile(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals("Original bio", result.getBio()); // Should remain unchanged
        assertEquals("https://example.com/original.jpg", result.getAvatarUrl()); // Should remain unchanged
    }

    @Test
    void testUpdateProfile_EmailUpdate() {
        // Arrange
        long userId = 1L;
        User existingUser = createMockUser(userId);
        existingUser.setEmailAddress("old@example.com");
        
        ProfileClient.ProfileUpdateRequest request = new ProfileClient.ProfileUpdateRequest();
        request.setEmailAddress("new@example.com");

        when(userRepository.findById(userId)).thenReturn(existingUser);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = profileService.updateProfile(userId, request);

        // Assert
        assertEquals("new@example.com", result.getEmailAddress());
    }

    @Test
    void testUpdateProfile_UsernameUpdate() {
        // Arrange
        long userId = 1L;
        User existingUser = createMockUser(userId);
        existingUser.setUsername("oldusername");
        
        ProfileClient.ProfileUpdateRequest request = new ProfileClient.ProfileUpdateRequest();
        request.setUsername("newusername");

        when(userRepository.findById(userId)).thenReturn(existingUser);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = profileService.updateProfile(userId, request);

        // Assert
        assertEquals("newusername", result.getUsername());
    }

    @Test
    void testUpdateProfile_AgeUpdate() {
        // Arrange
        long userId = 1L;
        User existingUser = createMockUser(userId);
        existingUser.setAge(25);
        
        ProfileClient.ProfileUpdateRequest request = new ProfileClient.ProfileUpdateRequest();
        request.setAge(26);

        when(userRepository.findById(userId)).thenReturn(existingUser);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = profileService.updateProfile(userId, request);

        // Assert
        assertEquals(26, result.getAge());
    }

    // Helper method
    private User createMockUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("testuser");
        user.setEmailAddress("test@example.com");
        user.setPasswordHash("hashedPassword");
        user.setAge(25);
        user.setBio("Test bio");
        user.setAvatarUrl("https://example.com/avatar.jpg");
        user.setFavoriteAnime("Test Anime");
        user.setFavoriteGenre("Action");
        user.setFavoriteManga("Test Manga");
        return user;
    }
}
