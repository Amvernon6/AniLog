package com.example.WatchLog;
import java.util.*;
import okhttp3.OkHttpClient;

public class tmdbClient implements tmdbInterface {
    @Override
    public List<TVShow> searchTVShow(String query) {
        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
        .url("https://api.themoviedb.org/3/search/tv")
        .get()
        .addHeader("accept", "application/json")
        .addHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzUxMDI4YWU5NThkYjEwMjUyMTkxMGFiMzAzMDE0OCIsIm5iZiI6MTc2NjUxOTIyMS40MDcsInN1YiI6IjY5NGFmMWI1YmFlOGMzNmE0ZDhjZjA3YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.O4Ho1HI5c0xuypyndmb-MmdOg1FSyaim1r_ER1ZO1MY")
        .build();

        try {
            Response response = client.newCall(request).execute();
            if (!response.isSuccessful()) {
                System.out.println("Request failed: " + response);
                return Collections.emptyList();
            } else if (response.body() == null) {
                System.out.println("Response body is null");
                return Collections.emptyList();
            }

            return parseTVShows(response.body().string());
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private List<TVShow> parseTVShows(String jsonResponse) {
        if (jsonResponse == null || jsonResponse.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Placeholder parsing logic
        List<TVShow> tvShows = new ArrayList<>();
        return tvShows;
    }
    
}
