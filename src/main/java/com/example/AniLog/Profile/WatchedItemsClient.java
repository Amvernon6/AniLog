package com.example.AniLog.Profile;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class WatchedItemsClient {
    
    private final WatchedItemsService watchedItemsService;

    public WatchedItemsClient(WatchedItemsService watchedItemsService) {
        this.watchedItemsService = watchedItemsService;
    }

    // Get all watched items for a user
    @GetMapping("/{userId}/watched")
    public ResponseEntity<?> getAllWatchedItems(@PathVariable Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID is required"));
        }
        
        try {
            List<WatchedItem> items = watchedItemsService.getAllWatchedItems(userId);
            return ResponseEntity.ok().body(items);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to retrieve watched items: " + e.getMessage()));
        }
    }

    // Get watched items by type (ANIME or MANGA)
    @GetMapping("/{userId}/watched/type/{type}")
    public ResponseEntity<?> getWatchedItemsByType(@PathVariable Long userId, @PathVariable String type) {
        if (userId == null || type == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID and type are required"));
        }

        if (!type.equalsIgnoreCase("ANIME") && !type.equalsIgnoreCase("MANGA")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Type must be either 'ANIME' or 'MANGA'"));
        }
        
        try {
            List<WatchedItem> items = watchedItemsService.getWatchedItemsByType(userId, type);
            return ResponseEntity.ok().body(items);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to retrieve watched items: " + e.getMessage()));
        }
    }

    // Get watched items by status
    @GetMapping("/{userId}/watched/status/{status}")
    public ResponseEntity<?> getWatchedItemsByStatus(@PathVariable Long userId, @PathVariable String status) {
        if (userId == null || status == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID and status are required"));
        }

        try {
            List<WatchedItem> items = watchedItemsService.getWatchedItemsByStatus(userId, status);
            return ResponseEntity.ok().body(items);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to retrieve watched items: " + e.getMessage()));
        }
    }

    // Get watched items by type and status
    @GetMapping("/{userId}/watched/type/{type}/status/{status}")
    public ResponseEntity<?> getWatchedItemsByTypeAndStatus(
        @PathVariable Long userId, 
        @PathVariable String type,
        @PathVariable String status) {
        
        if (userId == null || type == null || status == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID, type, and status are required"));
        }

        if (!type.equalsIgnoreCase("ANIME") && !type.equalsIgnoreCase("MANGA")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Type must be either 'ANIME' or 'MANGA'"));
        }
        
        try {
            List<WatchedItem> items = watchedItemsService.getWatchedItemsByTypeAndStatus(userId, type, status);
            return ResponseEntity.ok().body(items);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to retrieve watched items: " + e.getMessage()));
        }
    }

    // Add a new watched item
    @PostMapping("/watched/add")
    public ResponseEntity<?> addWatchedItem(@RequestBody WatchedItem item) {
        if (item == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Item data is required"));
        }

        if (item.getUserId() == null || item.getType() == null || item.getTitle() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID, type, and title are required"));
        }

        if (!item.getType().name().equalsIgnoreCase("ANIME") && !item.getType().name().equalsIgnoreCase("MANGA")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Type must be either 'ANIME' or 'MANGA'"));
        }

        try {
            WatchedItem addedItem = watchedItemsService.addWatchedItem(item);
            return ResponseEntity.ok().body(addedItem);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to add watched item: " + e.getMessage()));
        }
    }

    // Update a watched item
    @PutMapping("/watched/{itemId}")
    public ResponseEntity<?> updateWatchedItem(
        @PathVariable Long itemId,
        @RequestBody WatchedItem item) {
        
        if (itemId == null || item == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Item ID and data are required"));
        }

        if (item.getUserId() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID is required"));
        }

        try {
            WatchedItem updatedItem = watchedItemsService.updateWatchedItem(itemId, item);
            return ResponseEntity.ok().body(updatedItem);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to update watched item: " + e.getMessage()));
        }
    }

    // Update progress (episodes or chapters)
    @PatchMapping("/{userId}/watched/{anilistId}/progress")
    public ResponseEntity<?> updateProgress(
        @PathVariable Long userId,
        @PathVariable Integer anilistId,
        @RequestBody ProgressUpdate progressUpdate) {
        
        if (userId == null || anilistId == null || progressUpdate == null || progressUpdate.getProgress() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID, Anilist ID, and progress are required"));
        }

        try {
            WatchedItem updatedItem = watchedItemsService.updateProgress(userId, anilistId, progressUpdate.getProgress());
            return ResponseEntity.ok().body(updatedItem);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to update progress: " + e.getMessage()));
        }
    }

    // Remove a watched item by Anilist ID
    @DeleteMapping("/{userId}/watched/{anilistId}")
    public ResponseEntity<?> removeWatchedItem(@PathVariable Long userId, @PathVariable Integer anilistId) {
        if (userId == null || anilistId == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID and Anilist ID are required"));
        }

        try {
            watchedItemsService.removeWatchedItem(userId, anilistId);
            return ResponseEntity.ok().body(new SuccessResponse("Watched item removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to remove watched item: " + e.getMessage()));
        }
    }

    // Remove a watched item by item ID
    @DeleteMapping("/{userId}/watched/item/{itemId}")
    public ResponseEntity<?> removeWatchedItemById(@PathVariable Long userId, @PathVariable Long itemId) {
        if (userId == null || itemId == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID and item ID are required"));
        }

        try {
            watchedItemsService.removeWatchedItemById(userId, itemId);
            return ResponseEntity.ok().body(new SuccessResponse("Watched item removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to remove watched item: " + e.getMessage()));
        }
    }

    // Helper class for progress update
    public static class ProgressUpdate {
        private Integer progress;

        public Integer getProgress() {
            return progress;
        }

        public void setProgress(Integer progress) {
            this.progress = progress;
        }
    }
}
