package com.example.WatchLog;
import java.util.List;

public class tmdbClient {
    private final tmdbInterface tmdbService;

    public tmdbClient(tmdbInterface tmdbService) {
        this.tmdbService = tmdbService;
    }

    public List<TVShow> searchTVShow(String query) {
        return tmdbService.searchTVShow(query);
    }
}
