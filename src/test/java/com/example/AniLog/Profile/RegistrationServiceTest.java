package com.example.AniLog.Profile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

class RegistrationServiceTest {

    private RegistrationService registrationService;

    @Mock
    private PostgreSQLUserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        registrationService = new RegistrationService(userRepository, passwordEncoder);
    }

    @Test
    void testRegister_Success() {
        // Arrange
        String email = "newuser@example.com";
        String username = "newuser";
        String password = "Password123!";
        int age = 25;

        when(passwordEncoder.encode(password)).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        // Act
        User result = registrationService.register(email, username, password, age);

        // Assert
        assertNotNull(result);
        assertEquals(email.toLowerCase(), result.getEmailAddress());
        assertEquals(username, result.getUsername());
        assertEquals(age, result.getAge());
        verify(passwordEncoder).encode(password);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegister_EmailToLowerCase() {
        // Arrange
        String email = "NewUser@Example.COM";
        String username = "newuser";
        String password = "Password123!";
        int age = 25;

        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = registrationService.register(email, username, password, age);

        // Assert
        assertEquals("newuser@example.com", result.getEmailAddress());
    }

    @Test
    void testRegister_PasswordEncoded() {
        // Arrange
        String email = "test@example.com";
        String username = "testuser";
        String password = "plainPassword";
        int age = 30;

        when(passwordEncoder.encode(password)).thenReturn("encodedHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = registrationService.register(email, username, password, age);

        // Assert
        assertEquals("encodedHash", result.getPasswordHash());
        verify(passwordEncoder).encode(password);
    }

    @Test
    void testUserExists_True() {
        // Arrange
        String username = "existinguser";
        User existingUser = new User();
        existingUser.setUsername(username);

        when(userRepository.findByUsername(username)).thenReturn(existingUser);

        // Act
        boolean exists = registrationService.userExists(username);

        // Assert
        assertTrue(exists);
    }

    @Test
    void testUserExists_False() {
        // Arrange
        String username = "nonexistentuser";
        when(userRepository.findByUsername(username)).thenReturn(null);

        // Act
        boolean exists = registrationService.userExists(username);

        // Assert
        assertFalse(exists);
    }

    @Test
    void testEmailExists_True() {
        // Arrange
        String email = "existing@example.com";
        User existingUser = new User();
        existingUser.setEmailAddress(email);

        when(userRepository.findByEmailAddress(email.toLowerCase())).thenReturn(existingUser);

        // Act
        boolean exists = registrationService.emailExists(email);

        // Assert
        assertTrue(exists);
    }

    @Test
    void testEmailExists_False() {
        // Arrange
        String email = "nonexistent@example.com";
        when(userRepository.findByEmailAddress(email.toLowerCase())).thenReturn(null);

        // Act
        boolean exists = registrationService.emailExists(email);

        // Assert
        assertFalse(exists);
    }

    @Test
    void testEmailExists_CaseInsensitive() {
        // Arrange
        String email = "User@Example.COM";
        User existingUser = new User();
        existingUser.setEmailAddress("user@example.com");

        when(userRepository.findByEmailAddress("user@example.com")).thenReturn(existingUser);

        // Act
        boolean exists = registrationService.emailExists(email);

        // Assert
        assertTrue(exists);
        verify(userRepository).findByEmailAddress("user@example.com");
    }

    @Test
    void testRegister_AllFieldsSet() {
        // Arrange
        String email = "complete@example.com";
        String username = "completeuser";
        String password = "CompletePass123!";
        int age = 28;

        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(5L);
            return user;
        });

        // Act
        User result = registrationService.register(email, username, password, age);

        // Assert
        assertNotNull(result);
        assertEquals(5L, result.getId());
        assertEquals("complete@example.com", result.getEmailAddress());
        assertEquals("completeuser", result.getUsername());
        assertEquals("hashedPassword", result.getPasswordHash());
        assertEquals(28, result.getAge());
    }
}
