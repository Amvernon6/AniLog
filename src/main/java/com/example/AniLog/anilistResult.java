package com.example.AniLog;

import java.util.Collections;
import java.util.List;

public class AnilistResult {
    private final String type;
    private final Title title;
    private final String description;
    private final String format;
    private final Integer episodes;
    private final Integer chapters;
    private final Integer volumes;
    private final Integer averageScore;
    private final NextAiringEpisode nextAiringEpisode;
    private final Integer year;
    private final String coverImageUrl;
    private final String status;
    private final List<String> genres;
    private final List<StreamingEpisode> streamingEpisodes;
    private final List<String> studios;
    private final List<String> synonyms;
    private final Trailer trailer;
    private final boolean isAdult;

    public AnilistResult(
            String type,
            Title title,
            String description,
            String format,
            Integer episodes,
            Integer chapters,
            Integer volumes,
            Integer averageScore,
            NextAiringEpisode nextAiringEpisode,
            Integer year,
            String coverImageUrl,
            String status,
            List<String> genres,
            List<StreamingEpisode> streamingEpisodes,
            List<String> studios,
            List<String> synonyms,
            Trailer trailer,
            boolean isAdult) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.format = format;
        this.episodes = episodes;
        this.chapters = chapters;
        this.volumes = volumes;
        this.averageScore = averageScore;
        this.nextAiringEpisode = nextAiringEpisode;
        this.year = year;
        this.coverImageUrl = coverImageUrl;
        this.status = status;
        this.genres = genres != null ? genres : Collections.emptyList();
        this.streamingEpisodes = streamingEpisodes != null ? streamingEpisodes : Collections.emptyList();
        this.studios = studios != null ? studios : Collections.emptyList();
        this.synonyms = synonyms != null ? synonyms : Collections.emptyList();
        this.trailer = trailer;
        this.isAdult = isAdult;
    }

    public String getType() {
        return type;
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

    public List<StreamingEpisode> getStreamingEpisodes() {
        return streamingEpisodes;
    }

    public List<String> getStudios() {
        return studios;
    }

    public List<String> getSynonyms() {
        return synonyms;
    }

    public Trailer getTrailer() {
        return trailer;
    }

    public boolean isAdult() {
        return isAdult;
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

    public static class StreamingEpisode {
        private final String site;
        private final String thumbnail;
        private final String title;
        private final String url;

        public StreamingEpisode(String site, String thumbnail, String title, String url) {
            this.site = site;
            this.thumbnail = thumbnail;
            this.title = title;
            this.url = url;
        }

        public String getSite() {
            return site;
        }

        public String getThumbnail() {
            return thumbnail;
        }

        public String getTitle() {
            return title;
        }

        public String getUrl() {
            return url;
        }
    }

    public static class Trailer {
        private final String site;
        private final String thumbnail;

        public Trailer(String site, String thumbnail) {
            this.site = site;
            this.thumbnail = thumbnail;
        }

        public String getSite() {
            return site;
        }

        public String getThumbnail() {
            return thumbnail;
        }
    }
}