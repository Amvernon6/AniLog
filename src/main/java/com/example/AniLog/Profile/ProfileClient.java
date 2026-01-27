package com.example.AniLog.Profile;

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

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable long id) {
        User user = profileService.getProfile(id);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/safe/{id}")
    public ResponseEntity<?> getSafeProfile(@PathVariable long id) {
        User user = profileService.getSafeProfile(id);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable long id, @RequestBody ProfileUpdateRequest request) {
        try {
            User updatedUser = profileService.updateProfile(id, request);
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
        private String emailAddress;
        private String username;
        private String favoriteAnime;
        private String[] favoriteGenres;
        private int[] animeRankingOrder;
        private int[] mangaRankingOrder;
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

        public String getEmailAddress() {
            return emailAddress;
        }

        public void setEmailAddress(String emailAddress) {
            this.emailAddress = emailAddress;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getFavoriteAnime() {
            return favoriteAnime;
        }

        public void setFavoriteAnime(String favoriteAnime) {
            this.favoriteAnime = favoriteAnime;
        }

        public String[] getFavoriteGenres() {
            return favoriteGenres;
        }

        public void setFavoriteGenres(String[] favoriteGenres) {
            this.favoriteGenres = favoriteGenres;
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

        public int[] getAnimeRankingOrder() {
            return animeRankingOrder;
        }

        public void setAnimeRankingOrder(int[] animeRankingOrder) {
            this.animeRankingOrder = animeRankingOrder;
        }

        public int[] getMangaRankingOrder() {
            return mangaRankingOrder;
        }

        public void setMangaRankingOrder(int[] mangaRankingOrder) {
            this.mangaRankingOrder = mangaRankingOrder;
        }
    }
}