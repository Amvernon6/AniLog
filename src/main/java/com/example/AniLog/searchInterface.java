package com.example.AniLog;
import java.util.List;

public interface searchInterface {
    List<anilistResult> searchAniList(
        String query, 
        String type, 
        List<String> format, 
        List<String> status, 
        boolean isAdult, 
        List<String> genres, 
        String sortBy);
}