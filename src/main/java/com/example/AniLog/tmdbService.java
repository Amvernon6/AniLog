// package com.example.AniLog;

// import java.util.ArrayList;
// import java.util.Collections;
// import java.util.List;

// import okhttp3.HttpUrl;
// import okhttp3.OkHttpClient;
// import okhttp3.Request;
// import okhttp3.Response;

// public class tmdbService {
//     public List<Episode> getEpisodeRatings(String query) {
//         OkHttpClient client = new OkHttpClient();

//         HttpUrl url = HttpUrl.parse("https://api.themoviedb.org/3/search/tv")
//             .newBuilder()
//             .addQueryParameter("query", query)
//             .build();

//         Request request = new Request.Builder()
//         .url(url)
//         .get()
//         .addHeader("accept", "application/json")
//         .addHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzUxMDI4YWU5NThkYjEwMjUyMTkxMGFiMzAzMDE0OCIsIm5iZiI6MTc2NjUxOTIyMS40MDcsInN1YiI6IjY5NGFmMWI1YmFlOGMzNmE0ZDhjZjA3YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.O4Ho1HI5c0xuypyndmb-MmdOg1FSyaim1r_ER1ZO1MY")
//         .build();

//         try {
//             Response response = client.newCall(request).execute();
//             if (!response.isSuccessful()) {
//                 System.out.println("Request failed: " + response);
//                 return Collections.emptyList();
//             } else if (response.body() == null) {
//                 System.out.println("Response body is null");
//                 return Collections.emptyList();
//             }

//             return parseTVShows(response.body().string());
//         } catch (Exception e) {
//             e.printStackTrace();
//             return Collections.emptyList();
//         }
//     }

//     private List<Episode> parseTVShows(String jsonResponse) {
//         if (jsonResponse == null || jsonResponse.isEmpty()) {
//             return new ArrayList<>();
//         }
        
//         // Placeholder parsing logic
//         List<Episode> results = new ArrayList<>();
//         return results;
//     }
// }
