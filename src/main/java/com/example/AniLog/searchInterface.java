package com.example.AniLog;
import java.util.List;

public interface SearchInterface {
    List<AnilistResult> searchAniList(
        String query, 
        String type, 
        List<String> format, 
        List<String> status, 
        boolean isAdult, 
        List<String> genres, 
        String sortBy);
}