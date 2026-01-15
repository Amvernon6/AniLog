package com.example.AniLog.Search;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

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
                                        genre_not_in: ["Hentai"],
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
                                studios {
                                    nodes {
                                        name
                                    }
                                }
                                synonyms
                                isAdult
                            }
                        }
                    }
                    """;
        Map<String, Object> variables = new HashMap<>();
        variables.put("id", id);

        return aniListClient.executeQuery(gql, variables);
    }

    @Override
    public List<AnilistResult> getTrendingAniList(String type) {
        String gql = """
                    query ($type: MediaType) {
                        Page (page: 1, perPage: 20) {
                            media(sort: TRENDING_DESC, type: $type, genre_not_in: ["Hentai"]) {
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
                                studios {
                                    nodes {
                                        name
                                    }
                                }
                                synonyms
                                isAdult
                            }
                        }
                    }
                    """;
        Map<String, Object> variables = new HashMap<>();
        variables.put("type", type);

        return aniListClient.executeQuery(gql, variables);
    }

    @Override
    public List<AnilistResult> getPopularAniList(String type) {
        String gql = """
                    query ($type: MediaType) {
                        Page (page: 1, perPage: 20) {
                            media(sort: POPULARITY_DESC, type: $type, genre_not_in: ["Hentai"]) {
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
                                studios {
                                    nodes {
                                        name
                                    }
                                }
                                synonyms
                                isAdult
                            }
                        }
                    }
                    """;
        Map<String, Object> variables = new HashMap<>();
        variables.put("type", type);

        return aniListClient.executeQuery(gql, variables);
    }

    @Override
    public List<AnilistResult> getNewAniList(String type) {
        String gql = """
                    query ($type: MediaType, $startDate: FuzzyDateInt, $endDate: FuzzyDateInt) {
                        Page (page: 1, perPage: 20) {
                            media(
                                sort: POPULARITY_DESC, 
                                type: $type, 
                                startDate_greater: $startDate, 
                                startDate_lesser: $endDate, 
                                status_not_in: [NOT_YET_RELEASED, CANCELLED, HIATUS], 
                                genre_not_in: ["Hentai"]
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
                                studios {
                                    nodes {
                                        name
                                    }
                                }
                                synonyms
                                isAdult
                            }
                        }
                    }
                    """;
        Map<String, Object> variables = new HashMap<>();
        variables.put("type", type);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minus(1, ChronoUnit.MONTHS);

        variables.put("startDate", Integer.parseInt(startDate.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE)));
        variables.put("endDate", Integer.parseInt(endDate.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE)));

        return aniListClient.executeQuery(gql, variables);
    }

    // @Override
    // public List<AnilistResult> getGenreAniList(String type, String genre) {
    //     String gql = """
    //                 query ($type: MediaType, $genre: String) {
    //                     Page (page: 1, perPage: 20) {
    //                         media(sort: POPULARITY_DESC, type: $type, genre_in: [$genre]) {
    //                             id
    //                             type
    //                             title {
    //                                 romaji
    //                                 english
    //                                 native
    //                             }
    //                             description
    //                             format
    //                             episodes
    //                             chapters
    //                             volumes
    //                             averageScore
    //                             nextAiringEpisode {
    //                                 episode
    //                                 timeUntilAiring
    //                             }
    //                             startDate {
    //                                 year
    //                             }
    //                             coverImage {
    //                                 extraLarge
    //                             }
    //                             status
    //                             genres
    //                             studios {
    //                                 nodes {
    //                                     name
    //                                 }
    //                             }
    //                             synonyms
    //                             isAdult
    //                         }
    //                     }
    //                 }
    //                 """;
    //     Map<String, Object> variables = new HashMap<>();
    //     variables.put("type", type);
    //     variables.put("genre", genre);

    //     return aniListClient.executeQuery(gql, variables);
    // }

    @Override
    public List<AnilistResult> getComingSoonAniList(String type) {
        String gql = """
                    query ($type: MediaType, $startDate: FuzzyDateInt, $endDate: FuzzyDateInt) {
                        Page (page: 1, perPage: 20) {
                            media(
                                sort: [POPULARITY_DESC, START_DATE], 
                                type: $type, status: NOT_YET_RELEASED, 
                                startDate_greater: $startDate, 
                                startDate_lesser: $endDate,
                                genre_not_in: ["Hentai"]
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
                                        day
                                        month
                                        year
                                    }
                                    coverImage {
                                        extraLarge
                                    }
                                    status
                                    genres
                                    studios {
                                        nodes {
                                            name
                                        }
                                    }
                                    synonyms
                                    isAdult
                            }
                        }
                    }
                    """;
        Map<String, Object> variables = new HashMap<>();
        variables.put("type", type);
        variables.put("startDate", Integer.parseInt(LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE)));
        variables.put("endDate", Integer.parseInt(LocalDate.now().plusMonths(2).format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE)));

        return aniListClient.executeQuery(gql, variables);
    }
}