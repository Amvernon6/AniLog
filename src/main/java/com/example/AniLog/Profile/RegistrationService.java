package com.example.AniLog.Profile;

import java.util.Optional;

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
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt != null && userOpt.isPresent();
    }

    public boolean emailExists(String emailAddress) {
        Optional<User> emailOpt = userRepository.findByEmailAddress(emailAddress.toLowerCase());
        return emailOpt != null && emailOpt.isPresent();
    }
}