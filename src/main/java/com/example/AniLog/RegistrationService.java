package com.example.AniLog;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {
    private final PostgreSQLUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationService(PostgreSQLUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String emailAddress, String username, String password, int age) {
        User user = new User();
        user.setEmailAddress(emailAddress.toLowerCase());
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setAge(age);
        userRepository.save(user);
        return user;
    }

    public boolean userExists(String username) {
        return userRepository.findByUsername(username) != null;
    }

    public boolean emailExists(String emailAddress) {
        return userRepository.findByEmailAddress(emailAddress.toLowerCase()) != null;
    }
}