package com.example.AniLog.Profile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column
    private Integer age;

    @Column(length = 500)
    private String bio;

    @Column
    private String avatarUrl;

    @Column(nullable = false, unique = true)
    private String emailAddress;

    @Column
    private String favoriteAnime;

    @Column
    private String[] favoriteGenres;

    @Column
    private String favoriteManga;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
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
}
