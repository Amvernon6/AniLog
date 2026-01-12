package com.example.AniLog.Search;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.AniLog.Anilist.AnilistResult;

@RestController
@RequestMapping("/api/search")

public class SearchClient {
    private final SearchInterface searchService;

    public SearchClient(SearchInterface searchService) {
        this.searchService = searchService;
    }

    @PostMapping
    public List<AnilistResult> search(@RequestBody SearchRequest request) {
         return searchService.searchAniList(
            request.getQuery(),
            request.getType(),
            request.getFormat(),
            request.getStatus(),
            request.isAdult(),
            request.getGenres(),
            request.getSortBy()
        );
    }

    @GetMapping("/{id}")
    public List<AnilistResult> searchById(@PathVariable int id) {
        return searchService.searchAniListById(id);
    }

    public static class SearchRequest {
        private String query;
        private String type;
        private List<String> format;
        private List<String> status;
        private boolean isAdult;
        private List<Integer> averageScore;
        private List<String> genres;
        private String sortBy;

        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public List<String> getFormat() { return format; }
        public void setFormat(List<String> format) { this.format = format; }

        public List<String> getStatus() { return status; }
        public void setStatus(List<String> status) { this.status = status; }

        public boolean isAdult() { return isAdult; }
        public void setIsAdult(boolean isAdult) { this.isAdult = isAdult; }

        public List<Integer> getAverageScore() { return averageScore; }
        public void setAverageScore(List<Integer> averageScore) { this.averageScore = averageScore; }

        public List<String> getGenres() { return genres; }
        public void setGenres(List<String> genres) { this.genres = genres; }

        public String getSortBy() { return sortBy; }
        public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    }
}
