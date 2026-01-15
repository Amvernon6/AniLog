package com.example.AniLog.Anilist;

import java.util.Collections;
import java.util.List;

public class AnilistResult {
    private final int id;
    private final String type;
    private final Title title;
    private final String description;
    private final String format;
    private final Integer episodes;
    private final Integer chapters;
    private final Integer volumes;
    private final Integer averageScore;
    private final NextAiringEpisode nextAiringEpisode;
    private final Integer day;
    private final Integer month;
    private final Integer year;
    private final String coverImageUrl;
    private final String status;
    private final List<String> genres;
    private final List<String> studios;
    private final List<String> synonyms;
    private final boolean isAdult;

    public AnilistResult(
            int id,
            String type,
            Title title,
            String description,
            String format,
            Integer episodes,
            Integer chapters,
            Integer volumes,
            Integer averageScore,
            NextAiringEpisode nextAiringEpisode,
            Integer day,
            Integer month,
            Integer year,
            String coverImageUrl,
            String status,
            List<String> genres,
            List<String> studios,
            List<String> synonyms,
            boolean isAdult) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.format = format;
        this.episodes = episodes;
        this.chapters = chapters;
        this.volumes = volumes;
        this.averageScore = averageScore;
        this.nextAiringEpisode = nextAiringEpisode;
        this.day = day;
        this.month = month;
        this.year = year;
        this.coverImageUrl = coverImageUrl;
        this.status = status;
        this.genres = genres != null ? genres : Collections.emptyList();
        this.studios = studios != null ? studios : Collections.emptyList();
        this.synonyms = synonyms != null ? synonyms : Collections.emptyList();
        this.isAdult = isAdult;
    }

    public String getType() {
        return type;
    }

    public int getId() {
        return id;
    }

    public Title getTitle() {
        return title;
    }

    public String getFormat() {
        return format;
    }

    public Integer getEpisodes() {
        return episodes;
    }

    public Integer getChapters() {
        return chapters;
    }

    public Integer getVolumes() {
        return volumes;
    }

    public Integer getAverageScore() {
        return averageScore;
    }

    public NextAiringEpisode getNextAiringEpisode() {
        return nextAiringEpisode;
    }

    public Integer getDay() {
        return day;
    }

    public Integer getMonth() {
        return month;
    }

    public Integer getYear() {
        return year;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public String getStatus() {
        return status;
    }

    public List<String> getGenres() {
        return genres;
    }

    public List<String> getStudios() {
        return studios;
    }

    public List<String> getSynonyms() {
        return synonyms;
    }

    public boolean isAdult() {
        return isAdult;
    }

    public String getDescription() {
        return description;
    }

    public static class Title {
        private final String romaji;
        private final String english;
        private final String nativeTitle;

        public Title(String romaji, String english, String nativeTitle) {
            this.romaji = romaji;
            this.english = english;
            this.nativeTitle = nativeTitle;
        }

        public String getRomaji() {
            return romaji;
        }

        public String getEnglish() {
            return english;
        }

        public String getNativeTitle() {
            return nativeTitle;
        }
    }

    public static class NextAiringEpisode {
        private final Integer episode;
        private final Integer timeUntilAiring;

        public NextAiringEpisode(Integer episode, Integer timeUntilAiring) {
            this.episode = episode;
            this.timeUntilAiring = timeUntilAiring;
        }

        public Integer getEpisode() {
            return episode;
        }

        public Integer getTimeUntilAiring() {
            return timeUntilAiring;
        }
    }
}