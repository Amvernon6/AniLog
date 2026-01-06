package com.example.AniLog;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileClient {
    private final ProfileService profileService;

    public ProfileClient(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username) {
        User user = profileService.getProfile(username);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{username}")
    public ResponseEntity<?> updateProfile(@PathVariable String username, @RequestBody ProfileUpdateRequest request) {
        try {
            User updatedUser = profileService.updateProfile(username, request);
            if (updatedUser == null) {
                return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
            }
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    public static class ProfileUpdateRequest {
        private String bio;
        private String avatarUrl;
        private String favoriteAnime;
        private String favoriteGenre;
        private String favoriteManga;
        private Integer age;

        public String getBio() {
            return bio;
        }

        public void setBio(String bio) {
            this.bio = bio;
        }

        public String getAvatarUrl() {
            return avatarUrl;
        }

        public void setAvatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
        }

        public String getFavoriteAnime() {
            return favoriteAnime;
        }

        public void setFavoriteAnime(String favoriteAnime) {
            this.favoriteAnime = favoriteAnime;
        }

        public String getFavoriteGenre() {
            return favoriteGenre;
        }

        public void setFavoriteGenre(String favoriteGenre) {
            this.favoriteGenre = favoriteGenre;
        }

        public String getFavoriteManga() {
            return favoriteManga;
        }

        public void setFavoriteManga(String favoriteManga) {
            this.favoriteManga = favoriteManga;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }
    }

    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }
}