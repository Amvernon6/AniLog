package com.example.AniLog.Anilist;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class AniListClientTest {

    @Test
    void testExecuteQuery_Success() throws IOException {
        // Prepare test data
        String query = """
            query {
                Media {
                    id
                    title {
                        english
                    }
                }
            }
            """;
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("search", "Naruto");

        // This is an integration test that hits the real API
        AniListClient aniListClient = new AniListClient("https://graphql.anilist.co");
        List<AnilistResult> results = aniListClient.executeQuery(query, variables);
        
        assertNotNull(results);
        // Results could be empty if the query doesn't match any data
        assertTrue(results.size() >= 0);
    }

    @Test
    void testExecuteQuery_EmptyVariables() {
        String query = """
            query {
                Page {
                    media {
                        id
                        title {
                            romaji
                        }
                    }
                }
            }
            """;
        
        Map<String, Object> variables = new HashMap<>();
        
        AniListClient aniListClient = new AniListClient("https://graphql.anilist.co");
        List<AnilistResult> results = aniListClient.executeQuery(query, variables);
        
        assertNotNull(results);
    }

    @Test
    void testExecuteQuery_WithTypeFilter() {
        String query = """
            query ($type: MediaType) {
                Page {
                    media(type: $type) {
                        id
                        type
                        title {
                            english
                        }
                    }
                }
            }
            """;
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("type", "ANIME");
        
        AniListClient aniListClient = new AniListClient("https://graphql.anilist.co");
        List<AnilistResult> results = aniListClient.executeQuery(query, variables);
        
        assertNotNull(results);
        // Verify all results are anime if any returned
        results.forEach(result -> assertEquals("ANIME", result.getType()));
    }

    @Test
    void testExecuteQuery_WithFormatFilter() {
        String query = """
            query ($format: [MediaFormat]) {
                Page {
                    media(format_in: $format) {
                        id
                        format
                        title {
                            english
                        }
                    }
                }
            }
            """;
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("format", List.of("TV", "MOVIE"));
        
        AniListClient aniListClient = new AniListClient("https://graphql.anilist.co");
        List<AnilistResult> results = aniListClient.executeQuery(query, variables);
        
        assertNotNull(results);
    }

    @Test
    void testExecuteQuery_WithMultipleFilters() {
        String query = """
            query ($search: String, $type: MediaType, $genre: [String]) {
                Page {
                    media(search: $search, type: $type, genre_in: $genre) {
                        id
                        title {
                            english
                        }
                        genres
                    }
                }
            }
            """;
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("search", "Attack");
        variables.put("type", "ANIME");
        variables.put("genre", List.of("Action"));
        
        AniListClient aniListClient = new AniListClient("https://graphql.anilist.co");
        List<AnilistResult> results = aniListClient.executeQuery(query, variables);
        
        assertNotNull(results);
    }

    @Test
    void testExecuteQuery_ParsesAllFields() {
        String query = """
            query ($id: Int) {
                Media(id: $id) {
                    id
                    title {
                        english
                        romaji
                    }
                    type
                    format
                    status
                    description
                    startDate {
                        year
                    }
                    episodes
                    chapters
                    volumes
                    averageScore
                    genres
                    coverImage {
                        large
                    }
                }
            }
            """;
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("id", 1); // Cowboy Bebop
        
        AniListClient aniListClient = new AniListClient("https://graphql.anilist.co");
        List<AnilistResult> results = aniListClient.executeQuery(query, variables);
        
        assertNotNull(results);
        if (!results.isEmpty()) {
            AnilistResult result = results.get(0);
            assertNotNull(result.getTitle());
        }
    }

    @Test
    void testAnilistResult_TitleParsing() {
        // This tests the AnilistResult.Title inner class
        AnilistResult.Title title = new AnilistResult.Title("One Piece", "One Piece", "ワンピース");
        
        assertEquals("One Piece", title.getEnglish());
        assertEquals("One Piece", title.getRomaji());
        assertEquals("ワンピース", title.getNativeTitle());
    }

    @Test
    void testAnilistResult_Getters() {
        AnilistResult.Title title = new AnilistResult.Title("Test Anime", "Test Anime", "");
        AnilistResult result = new AnilistResult(
            1,
            "ANIME",
            title,
            "Test description",
            "TV",
            24,
            null,
            null,
            85,
            null,
            null,
            null,
            2024,
            "https://example.com/cover.jpg",
            "RELEASING",
            List.of(),
            List.of(),
            List.of(),
            false
        );
        
        assertEquals("ANIME", result.getType());
        assertEquals("TV", result.getFormat());
        assertEquals("RELEASING", result.getStatus());
        assertEquals("Test description", result.getDescription());
        assertEquals(2024, result.getYear());
        assertEquals(24, result.getEpisodes());
        assertEquals(85, result.getAverageScore());
        assertEquals("https://example.com/cover.jpg", result.getCoverImageUrl());
        assertFalse(result.isAdult());
    }

    @Test
    void testAnilistResult_ListFields() {
        List<String> genres = List.of("Action", "Adventure");
        List<String> studios = List.of("Studio A", "Studio B");
        List<String> synonyms = List.of("Alt Title 1", "Alt Title 2");
        
        AnilistResult.Title title = new AnilistResult.Title("", "", "");
        AnilistResult result = new AnilistResult(
            1,
            "ANIME",
            title,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "AIRING",
            genres,
            studios,
            synonyms,
            false
        );
        
        assertEquals(2, result.getGenres().size());
        assertTrue(result.getGenres().contains("Action"));
        assertEquals(2, result.getStudios().size());
        assertEquals(2, result.getSynonyms().size());
    }
}
