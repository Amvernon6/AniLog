package com.example.WatchLog;
import java.util.List;

public class searchClient {
    private final searchInterface searchService;

    public searchClient(searchInterface searchService) {
        this.searchService = searchService;
    }

    public List<animeResult> search(String query) {
        return searchService.searchAnime(query);
    }
}
