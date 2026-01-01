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
        public List<anilistResult> searchAniList(
            String query,
            String type,
            String format,
            List<String> status,
            boolean isAdult,
            List<String> genres,
            String sortBy) {
            String gql = """
                        query (
                                $search: String, 
                                $page: Int, 
                                $perPage: Int,
                                $type: MediaType,
                                $format: [MediaFormat],
                                $status: MediaStatus,
                                $isAdult: Boolean,
                                $genres: [String],
                                $genresNotIn: [String],
                                $sortBy: [MediaSort]
                            ) {
                                Page(page: $page, perPage: $perPage) {
                                    pageInfo {
                                        total
                                        currentPage
                                        lastPage
                                        hasNextPage
                                    }
                                    media(
                                        search: $search,
                                        type: $type,
                                        format_in: $format,
                                        status: $status,
                                        isAdult: $isAdult,
                                        genre_in: $genres,
                                        genre_not_in: $genresNotIn,
                                        sort: $sortBy
                                    ) {
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
        if (type != null && !type.isEmpty()) variables.put("type", type);
        if (format != null && !format.isEmpty() && !format.equals("Any")) variables.put("format", List.of(format));
        if (status != null && !status.isEmpty()) variables.put("status", status);
        if (!isAdult) variables.put("isAdult", isAdult);
        if (genres != null && !genres.isEmpty()) variables.put("genres", genres);
        if (sortBy != null && !sortBy.isEmpty()) variables.put("sortBy", List.of(sortBy));
        String[] genresNotIn = {"Hentai"};
        variables.put("genresNotIn", genresNotIn);


        return aniListClient.executeQuery(gql, variables);
    }
    
}
