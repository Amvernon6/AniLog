package com.example.AniLog.Profile;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
    private final PostgreSQLUserRepository userRepository;

    public ProfileService(PostgreSQLUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getProfile(long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User updateProfile(long id, ProfileClient.ProfileUpdateRequest request) {
        User user = userRepository.findById(id);
        if (user == null) {
            return null;
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getEmailAddress() != null) {
            user.setEmailAddress(request.getEmailAddress());
        }
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
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
