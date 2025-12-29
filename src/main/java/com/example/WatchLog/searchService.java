package com.example.WatchLog;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class searchService implements searchInterface {
    private aniListClient aniListClient;

    public searchService(aniListClient aniListClient) {
        this.aniListClient = aniListClient;
    }

    @Override
    public List<animeResult> searchAnime(String query) {
        String gql = "query ($search: String, $page: Int, $perPage: Int) {\n" +
        "    Page(page: $page, perPage: $perPage) {\n" +
        "      pageInfo {\n" +
        "        total\n" +
        "        currentPage\n" +
        "        lastPage\n" +
        "        hasNextPage\n" +
        "      }\n" +
        "      media(search: $search, type: ANIME) {\n" +
        "        id\n" +
        "        title {\n" +
        "          romaji\n" +
        "          english\n" +
        "        }\n" +
        "        format\n" +
        "        episodes\n" +
        "        averageScore\n" +
        "        startDate {\n" +
        "          year\n" +
        "        }\n" +
        "      }\n" +
        "    }\n" +
        "  }";

        Map<String, Object> variables = new HashMap<>();
        variables.put("search", query);

        return aniListClient.executeQuery(gql, variables);
    }
    
}
