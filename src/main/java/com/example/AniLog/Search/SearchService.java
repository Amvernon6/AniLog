package com.example.AniLog.Search;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.AniLog.Anilist.AniListClient;
import com.example.AniLog.Anilist.AnilistResult;

@Service
public class SearchService implements SearchInterface {
    private final AniListClient aniListClient;

    public SearchService(AniListClient aniListClient) {
        this.aniListClient = aniListClient;
    }

    @Override
        public List<AnilistResult> searchAniList(
            String query,
            String type,
            List<String> format,
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
                                $statusIn: [MediaStatus],
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
                                        status_in: $statusIn,
                                        isAdult: $isAdult,
                                        genre_in: $genres,
                                        genre_not_in: $genresNotIn,
                                        sort: $sortBy
                                    ) {
                                        id
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
        if (query != null && !query.isEmpty()) variables.put("search", query);
        if (type != null && !type.isEmpty() && !type.equals("Any")) variables.put("type", type);
        if (format != null && !format.isEmpty()) variables.put("format", format);
        if (status != null && !status.isEmpty()) variables.put("statusIn", status);
        if (!isAdult) variables.put("isAdult", isAdult);
        if (genres != null && !genres.isEmpty()) variables.put("genres", genres);
        if (sortBy != null && !sortBy.isEmpty()) variables.put("sortBy", List.of(sortBy));
        String[] genresNotIn = {"Hentai"};
        variables.put("genresNotIn", genresNotIn);


        return aniListClient.executeQuery(gql, variables);
    }

    @Override
    public List<AnilistResult> searchAniListById(int id) {
        String gql = """
                    query ($id: Int) {
                        Page {
                            media(id: $id) {
                                id
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
        variables.put("id", id);

        return aniListClient.executeQuery(gql, variables);
    }
}