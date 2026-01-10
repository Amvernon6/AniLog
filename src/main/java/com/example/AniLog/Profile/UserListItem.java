package com.example.AniLog.Profile;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_list_item")
public class UserListItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MediaType type; // ANIME or MANGA

    @Column
    private String coverImageUrl;

    @Column(nullable = false)
    private LocalDateTime addedDate;

    @Column
    private Integer anilistId;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public Integer getAnilistId() {
        return anilistId;
    }

    public void setAnilistId(Integer anilistId) {
        this.anilistId = anilistId;
    }

    public LocalDateTime getAddedDate() {
        return addedDate;
    }

    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }

    // Lifecycle callback
    @PrePersist
    protected void onCreate() {
        addedDate = LocalDateTime.now();
    }

    // Enum for media type
    public enum MediaType {
        ANIME,
        MANGA
    }
}
