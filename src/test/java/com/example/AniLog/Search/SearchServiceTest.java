package com.example.AniLog.Search;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.example.AniLog.Anilist.AniListClient;
import com.example.AniLog.Anilist.AnilistResult;


class SearchServiceTest {

    private SearchService searchService;

    @Mock
    private AniListClient mockAniListClient;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        MockitoAnnotations.openMocks(this);
        searchService = new SearchService(mockAniListClient);
    }

    @Test
    void testSearchAniList_BasicQuery() {
        // Arrange
        String query = "Naruto";
        List<AnilistResult> mockResults = createMockResults();
        
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            query, null, List.of(), List.of(), false, List.of(), "POPULARITY_DESC"
        );

        // Assert
        assertNotNull(results);
        assertEquals(2, results.size());
        verify(mockAniListClient, times(1)).executeQuery(anyString(), anyMap());
    }

    @Test
    void testSearchAniList_WithTypeFilter() {
        // Arrange
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            "One Piece", "ANIME", List.of(), List.of(), false, List.of(), "POPULARITY_DESC"
        );

        // Assert
        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
            Map<String, Object> map = (Map<String, Object>) vars;
            return "ANIME".equals(map.get("type"));
        }));
    }

    @Test
    void testSearchAniList_WithFormatFilter() {
        // Arrange
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        List<String> formats = List.of("TV", "MOVIE");

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            "Attack on Titan", null, formats, List.of(), false, List.of(), "POPULARITY_DESC"
        );

        // Assert
        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
            Map<String, Object> map = (Map<String, Object>) vars;
            return formats.equals(map.get("format"));
        }));
    }

    @Test
    void testSearchAniList_WithStatusFilter() {
        // Arrange
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        List<String> statuses = List.of("RELEASING", "FINISHED");

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            "My Hero Academia", null, List.of(), statuses, false, List.of(), "POPULARITY_DESC"
        );

        // Assert
        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
            Map<String, Object> map = (Map<String, Object>) vars;
            return statuses.equals(map.get("statusIn"));
        }));
    }

    @Test
    void testSearchAniList_WithGenreFilter() {
        // Arrange
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        List<String> genres = List.of("Action", "Adventure");

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            "Demon Slayer", null, List.of(), List.of(), false, genres, "POPULARITY_DESC"
        );

        // Assert
        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
            Map<String, Object> map = (Map<String, Object>) vars;
            return genres.equals(map.get("genres"));
        }));
    }

    // @Test
    // void testSearchAniList_WithAdultContent() {
    //     // Arrange
    //     List<AnilistResult> mockResults = createMockResults();
    //     when(mockAniListClient.executeQuery(anyString(), anyMap()))
    //         .thenReturn(mockResults);

    //     // Act
    //     List<AnilistResult> results = searchService.searchAniList(
    //         "Test", null, List.of(), List.of(), false, List.of(), "POPULARITY_DESC"
    //     );

    //     // Assert
    //     assertNotNull(results);
    //     verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
    //         Map<String, Object> map = (Map<String, Object>) vars;
    //         return Boolean.FALSE.equals(map.get("isAdult"));
    //     }));
    // }

    @Test
    void testSearchAniList_WithSortBy() {
        // Arrange
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            "Test", null, List.of(), List.of(), false, List.of(), "SCORE_DESC"
        );

        // Assert
        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
            Map<String, Object> map = (Map<String, Object>) vars;
            @SuppressWarnings("unchecked")
            List<String> sortBy = (List<String>) map.get("sortBy");
            return sortBy != null && sortBy.contains("SCORE_DESC");
        }));
    }

    @Test
    void testSearchAniList_WithAllFilters() {
        // Arrange
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            "Fullmetal",
            "ANIME",
            List.of("TV"),
            List.of("FINISHED"),
            false,
            List.of("Action", "Drama"),
            "SCORE_DESC"
        );

        // Assert
        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), anyMap());
    }

    @Test
    void testSearchAniList_EmptyQuery() {
        // Arrange
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            "", null, List.of(), List.of(), false, List.of(), "POPULARITY_DESC"
        );

        // Assert
        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), anyMap());
    }

    @Test
    void testSearchAniList_NullQuery() {
        // Arrange
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            null, null, List.of(), List.of(), false, List.of(), "POPULARITY_DESC"
        );

        // Assert
        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), anyMap());
    }

    @Test
    void testSearchAniList_EmptyResults() {
        // Arrange
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(new ArrayList<>());

        // Act
        List<AnilistResult> results = searchService.searchAniList(
            "NonExistentAnime123456", null, List.of(), List.of(), false, List.of(), "POPULARITY_DESC"
        );

        // Assert
        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    void testGetPopularAniList() {
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        List<AnilistResult> results = searchService.getPopularAniList("ANIME");

        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
            Map<String, Object> map = (Map<String, Object>) vars;
            return "ANIME".equals(map.get("type"));
        }));
    }

    @Test
    void testGetNewAniList() {
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        List<AnilistResult> results = searchService.getNewAniList("ANIME");

        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
            Map<String, Object> map = (Map<String, Object>) vars;
            return "ANIME".equals(map.get("type"))
                && map.containsKey("startDate")
                && map.containsKey("endDate");
        }));
    }

    @Test
    void testGetComingSoonAniList() {
        List<AnilistResult> mockResults = createMockResults();
        when(mockAniListClient.executeQuery(anyString(), anyMap()))
            .thenReturn(mockResults);

        List<AnilistResult> results = searchService.getComingSoonAniList("ANIME");

        assertNotNull(results);
        verify(mockAniListClient, times(1)).executeQuery(anyString(), argThat(vars -> {
            Map<String, Object> map = (Map<String, Object>) vars;
            return "ANIME".equals(map.get("type"))
                && map.containsKey("startDate")
                && map.containsKey("endDate");
        }));
    }

    // Helper method to create mock results
    private List<AnilistResult> createMockResults() {
        List<AnilistResult> results = new ArrayList<>();
        
        AnilistResult.Title title1 = new AnilistResult.Title("", "Test Anime 1", "");
        AnilistResult result1 = new AnilistResult(
            1,
            "ANIME",
            title1,
            null,
            "TV",
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
            List.of(),
            List.of(),
            List.of(),
            false
        );
        
        AnilistResult.Title title2 = new AnilistResult.Title("", "Test Anime 2", "");
        AnilistResult result2 = new AnilistResult(
            1,
            "ANIME",
            title2,
            null,
            "MOVIE",
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
            List.of(),
            List.of(),
            List.of(),
            false
        );
        
        results.add(result1);
        results.add(result2);
        
        return results;
    }
}
