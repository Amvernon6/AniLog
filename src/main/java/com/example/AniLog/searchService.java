package com.example.AniLog;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class searchService implements searchInterface {
    private final aniListClient aniListClient;

    public searchService(aniListClient aniListClient) {
        this.aniListClient = aniListClient;
    }

    @Override
        public List<anilistResult> searchAniList(String query) {
            String gql = """
                        query ($search: String, $page: Int, $perPage: Int) {
                            Page(page: $page, perPage: $perPage) {
                                pageInfo {
                                    total
                                    currentPage
                                    lastPage
                                    hasNextPage
                                }
                                media(search: $search) {
                                    type
                                    title {
                                        romaji
                                        english
                                        native
                                    }
                                    description
                                    format
                                    episodes
                                    chapters
                                    volumes
                                    averageScore
                                    nextAiringEpisode {
                                        episode
                                        timeUntilAiring
                                    }
                                    startDate {
                                        year
                                    }
                                    coverImage {
                                        extraLarge
                                    }
                                    status
                                    genres
                                    streamingEpisodes {
                                        site
                                        thumbnail
                                        title
                                        url
                                    }
                                    studios {
                                        nodes {
                                            name
                                        }
                                    }
                                    synonyms
                                    trailer {
                                        site
                                        thumbnail
                                    }
                                    isAdult
                                }
                            }
                        }
                        """;

        Map<String, Object> variables = new HashMap<>();
        variables.put("search", query);

        return aniListClient.executeQuery(gql, variables);
    }
    
}
