package com.example.AniLog;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class LoginService {
    private final PostgreSQLUserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    
    public LoginService(PostgreSQLUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(String entry, String password) {
        // Query the user by username
        User userByUsername = userRepository.findByUsername(entry);

        // Query the user by email
        User userByEmail = userRepository.findByEmailAddress(entry);

        // Determine which user to use
        User user = (userByUsername != null) ? userByUsername : userByEmail;

        // Check if user exists and password matches
        if (user != null && passwordEncoder.matches(password, user.getPasswordHash())) {
            return user;
        }
        return null;
    }
}
