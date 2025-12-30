package com.example.AniLog;
import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class searchClient {
    private final searchInterface searchService;

    public searchClient(searchInterface searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public List<anilistResult> search(@RequestParam String query) {
        return searchService.searchAniList(query);
    }
}
