package com.example.AniLog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
    private final PostgreSQLUserRepository userRepository;

    public ProfileService(PostgreSQLUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getProfile(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User updateProfile(String username, ProfileClient.ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return null;
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getFavoriteAnime() != null) {
            user.setFavoriteAnime(request.getFavoriteAnime());
        }
        if (request.getFavoriteGenre() != null) {
            user.setFavoriteGenre(request.getFavoriteGenre());
        }
        if (request.getFavoriteManga() != null) {
            user.setFavoriteManga(request.getFavoriteManga());
        }
        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }

        return userRepository.save(user);
    }
}
