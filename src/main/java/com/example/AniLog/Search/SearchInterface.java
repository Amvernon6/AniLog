package com.example.AniLog.Search;
import java.util.List;

import com.example.AniLog.Anilist.AnilistResult;

public interface SearchInterface {
    List<AnilistResult> searchAniList(
        String query, 
        String type, 
        List<String> format, 
        List<String> status, 
        boolean isAdult, 
        List<String> genres, 
        String sortBy);

    List<AnilistResult> searchAniListById(int id);

    List<AnilistResult> getTrendingAniList(String type);

    List<AnilistResult> getPopularAniList(String type);

    List<AnilistResult> getNewAniList(String type);

    // List<AnilistResult> getGenreAniList(String type, String genre);

    List<AnilistResult> getComingSoonAniList(String type);
}