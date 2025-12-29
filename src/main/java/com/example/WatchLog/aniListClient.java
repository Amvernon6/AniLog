package com.example.WatchLog;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    public List<animeResult> executeQuery(String query, Map<String, Object> variables) {
        List<animeResult> results = new ArrayList<>();

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
                // TODO: Return empty list or consider throwing an exception depending on design
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

                // title selection: prefer english, fallback to romaji
                String title = null;
                if (item.has("title") && item.get("title").isJsonObject()) {
                    JsonObject t = item.getAsJsonObject("title");
                    if (t.has("english") && !t.get("english").isJsonNull()) {
                        title = t.get("english").getAsString();
                    }
                    if ((title == null || title.isBlank()) && t.has("romaji") && !t.get("romaji").isJsonNull()) {
                        title = t.get("romaji").getAsString();
                    }
                }
                if (title == null) title = "Unknown";

                // year from startDate.year
                int year = 0;
                if (item.has("startDate") && item.get("startDate").isJsonObject()) {
                    JsonObject sd = item.getAsJsonObject("startDate");
                    if (sd.has("year") && !sd.get("year").isJsonNull()) {
                        try {
                            year = sd.get("year").getAsInt();
                        } catch (Exception ignored) {
                            year = 0;
                        }
                    }
                }

                // animator is not provided by the query; set to Unknown
                String animator = "Unknown";
                
                //results.add(new animeResult(title, year, animator));
            }
        } catch (IOException e) {
            // TODO: Swallowing exceptions; consider logging or rethrowing in a real app
            return results;
        }

        return results;
    }
}