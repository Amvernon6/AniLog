package com.example.AniLog.Profile;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "watched_items")
public class WatchedItem {
    
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
    private LocalDateTime watchedDate;

    @Column
    private LocalDateTime completedDate;

    @Column
    private Integer anilistId;

    @Column
    private Integer episodesWatched; // For anime - current progress

    @Column
    private Integer totalEpisodes; // For anime - total episodes

    @Column
    private Integer chaptersRead; // For manga - current progress

    @Column
    private Integer totalChapters; // For manga - total chapters

    @Column
    @Enumerated(EnumType.STRING)
    private WatchStatus status; // WATCHING, COMPLETED, ON_HOLD, DROPPED, PLAN_TO_WATCH

    @Column
    private Double rating; // User rating out of 10

    @Column(length = 1000)
    private String notes; // Personal notes

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

    public LocalDateTime getWatchedDate() {
        return watchedDate;
    }

    public void setWatchedDate(LocalDateTime watchedDate) {
        this.watchedDate = watchedDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public Integer getEpisodesWatched() {
        return episodesWatched;
    }

    public void setEpisodesWatched(Integer episodesWatched) {
        this.episodesWatched = episodesWatched;
    }

    public Integer getTotalEpisodes() {
        return totalEpisodes;
    }

    public void setTotalEpisodes(Integer totalEpisodes) {
        this.totalEpisodes = totalEpisodes;
    }

    public Integer getChaptersRead() {
        return chaptersRead;
    }

    public void setChaptersRead(Integer chaptersRead) {
        this.chaptersRead = chaptersRead;
    }

    public Integer getTotalChapters() {
        return totalChapters;
    }

    public void setTotalChapters(Integer totalChapters) {
        this.totalChapters = totalChapters;
    }

    public WatchStatus getStatus() {
        return status;
    }

    public void setStatus(WatchStatus status) {
        this.status = status;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Lifecycle callback
    @PrePersist
    protected void onCreate() {
        if (watchedDate == null) {
            watchedDate = LocalDateTime.now();
        }
        if (status == null) {
            status = WatchStatus.WATCHING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // Auto-set completedDate when status changes to COMPLETED
        if (status == WatchStatus.COMPLETED && completedDate == null) {
            completedDate = LocalDateTime.now();
        }
    }

    // Enum for media type
    public enum MediaType {
        ANIME,
        MANGA
    }

    // Enum for watch status
    public enum WatchStatus {
        WATCHING,
        READING,
        COMPLETED,
        ON_HOLD,
        DROPPED,
        PLAN_TO_WATCH,
        PLAN_TO_READ
    }
}
