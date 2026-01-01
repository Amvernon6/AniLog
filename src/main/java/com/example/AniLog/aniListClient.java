package com.example.AniLog;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.example.AniLog.anilistResult.*;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class aniListClient {
    private final String apiUrl;
    private final OkHttpClient httpClient;
    private final Gson gson;

    public aniListClient(String apiUrl) {
        this.apiUrl = apiUrl;
        this.httpClient = new OkHttpClient();
        this.gson = new Gson();
    }

    public List<anilistResult> executeQuery(String query, Map<String, Object> variables) {
        List<anilistResult> results = new ArrayList<>();

        // Prepare GraphQL request payload
        JsonObject payload = new JsonObject();
        payload.addProperty("query", query);
        payload.add("variables", gson.toJsonTree(variables));

        MediaType jsonMediaType = MediaType.parse("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(payload.toString(), jsonMediaType);

        Request request = new Request.Builder()
                .url(this.apiUrl)
                .post(body)
                .addHeader("Accept", "application/json")
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                System.err.println("Request failed with status code: " + response.code());
                System.err.println("Response message: " + (response.body() != null ? response.body().string() : "null"));
                return results;
            }

            String responseBody = response.body() != null ? response.body().string() : "";
            if (responseBody.isEmpty()) {
                return results;
            }

            JsonObject root = JsonParser.parseString(responseBody).getAsJsonObject();
            JsonObject data = root.has("data") && root.get("data").isJsonObject() ? root.getAsJsonObject("data") : null;
            if (data == null) {
                return results;
            }

            JsonObject page = data.has("Page") && data.get("Page").isJsonObject() ? data.getAsJsonObject("Page") : null;
            if (page == null) {
                return results;
            }

            JsonArray media = page.has("media") && page.get("media").isJsonArray() ? page.getAsJsonArray("media") : null;
            if (media == null) {
                return results;
            }

            for (JsonElement el : media) {
                if (!el.isJsonObject()) continue;
                JsonObject item = el.getAsJsonObject();

                Title title = parseTitle(item);
                String type = getString(item, "type");
                String description = getString(item, "description");
                String format = getString(item, "format");
                Integer episodes = getInteger(item, "episodes");
                Integer chapters = getInteger(item, "chapters");
                Integer volumes = getInteger(item, "volumes");
                Integer averageScore = getInteger(item, "averageScore");
                NextAiringEpisode nextAiring = parseNextAiring(item);
                Integer year = parseYear(item);
                String coverImageUrl = parseCoverImage(item);
                String status = getString(item, "status");
                List<String> genres = parseStringArray(item, "genres");
                List<StreamingEpisode> streamingEpisodes = parseStreamingEpisodes(item);
                List<String> studios = parseStudios(item);
                List<String> synonyms = parseStringArray(item, "synonyms");
                Trailer trailer = parseTrailer(item);
                boolean isAdult = item.has("isAdult") && !item.get("isAdult").isJsonNull() && item.get("isAdult").getAsBoolean();

                results.add(new anilistResult(
                        type,
                        title,
                        description,
                        format,
                        episodes,
                        chapters,
                        volumes,
                        averageScore,
                        nextAiring,
                        year,
                        coverImageUrl,
                        status,
                        genres,
                        streamingEpisodes,
                        studios,
                        synonyms,
                        trailer,
                        isAdult));
            }
        } catch (IOException e) {
            System.err.println("IOException during API request: " + e.getMessage());
            return results;
        }

        return results;
    }

    private Title parseTitle(JsonObject item) {
        if (!item.has("title") || !item.get("title").isJsonObject()) {
            return new Title(null, null, null);
        }
        JsonObject t = item.getAsJsonObject("title");
        String romaji = getString(t, "romaji");
        String english = getString(t, "english");
        String nativeTitle = getString(t, "native");
        return new Title(romaji, english, nativeTitle);
    }

    private NextAiringEpisode parseNextAiring(JsonObject item) {
        if (!item.has("nextAiringEpisode") || !item.get("nextAiringEpisode").isJsonObject()) return null;
        JsonObject nae = item.getAsJsonObject("nextAiringEpisode");
        Integer episode = getInteger(nae, "episode");
        Integer timeUntilAiring = getInteger(nae, "timeUntilAiring");
        if (episode == null && timeUntilAiring == null) return null;
        return new NextAiringEpisode(episode, timeUntilAiring);
    }

    private Integer parseYear(JsonObject item) {
        if (!item.has("startDate") || !item.get("startDate").isJsonObject()) return null;
        JsonObject sd = item.getAsJsonObject("startDate");
        return getInteger(sd, "year");
    }

    private String parseCoverImage(JsonObject item) {
        if (!item.has("coverImage") || !item.get("coverImage").isJsonObject()) return null;
        JsonObject ci = item.getAsJsonObject("coverImage");
        return getString(ci, "extraLarge");
    }

    private List<String> parseStringArray(JsonObject item, String key) {
        if (!item.has(key) || !item.get(key).isJsonArray()) return Collections.emptyList();
        List<String> list = new ArrayList<>();
        for (JsonElement el : item.getAsJsonArray(key)) {
            if (!el.isJsonNull()) list.add(el.getAsString());
        }
        return list;
    }

    private List<StreamingEpisode> parseStreamingEpisodes(JsonObject item) {
        if (!item.has("streamingEpisodes") || !item.get("streamingEpisodes").isJsonArray()) return Collections.emptyList();
        List<StreamingEpisode> list = new ArrayList<>();
        for (JsonElement el : item.getAsJsonArray("streamingEpisodes")) {
            if (!el.isJsonObject()) continue;
            JsonObject se = el.getAsJsonObject();
            list.add(new StreamingEpisode(
                    getString(se, "site"),
                    getString(se, "thumbnail"),
                    getString(se, "title"),
                    getString(se, "url")));
        }
        return list;
    }

    private List<String> parseStudios(JsonObject item) {
        if (!item.has("studios") || !item.get("studios").isJsonObject()) return Collections.emptyList();
        JsonObject studios = item.getAsJsonObject("studios");
        if (!studios.has("nodes") || !studios.get("nodes").isJsonArray()) return Collections.emptyList();
        List<String> list = new ArrayList<>();
        for (JsonElement el : studios.getAsJsonArray("nodes")) {
            if (!el.isJsonObject()) continue;
            String name = getString(el.getAsJsonObject(), "name");
            if (name != null && !name.isBlank()) list.add(name);
        }
        return list;
    }

    private Trailer parseTrailer(JsonObject item) {
        if (!item.has("trailer") || !item.get("trailer").isJsonObject()) return null;
        JsonObject t = item.getAsJsonObject("trailer");
        String site = getString(t, "site");
        String thumbnail = getString(t, "thumbnail");
        if (site == null && thumbnail == null) return null;
        return new Trailer(site, thumbnail);
    }

    private String getString(JsonObject obj, String key) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return null;
        return obj.get(key).getAsString();
    }

    private Integer getInteger(JsonObject obj, String key) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return null;
        try {
            return obj.get(key).getAsInt();
        } catch (Exception e) {
            return null;
        }
    }
}