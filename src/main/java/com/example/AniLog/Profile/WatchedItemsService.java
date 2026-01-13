package com.example.AniLog.Profile;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class WatchedItemsService {
    private final WatchedItemsRepository watchedItemsRepository;
    
    public WatchedItemsService(WatchedItemsRepository watchedItemsRepository) {
        this.watchedItemsRepository = watchedItemsRepository;
    }

    // Get all watched items for a user
    public List<WatchedItem> getAllWatchedItems(Long userId) {
        return watchedItemsRepository.findByUserIdOrderByWatchedDateDesc(userId);
    }

    // Get watched items by type
    public List<WatchedItem> getWatchedItemsByType(Long userId, String type) {
        return watchedItemsRepository.findByUserIdAndType(
            userId, 
            WatchedItem.MediaType.valueOf(type.toUpperCase())
        );
    }

    // Get watched items by status
    public List<WatchedItem> getWatchedItemsByStatus(Long userId, String status) {
        return watchedItemsRepository.findByUserIdAndStatus(
            userId, 
            WatchedItem.WatchStatus.valueOf(status.toUpperCase())
        );
    }

    // Get watched items by type and status
    public List<WatchedItem> getWatchedItemsByTypeAndStatus(Long userId, String type, String status) {
        return watchedItemsRepository.findByUserIdAndTypeAndStatus(
            userId, 
            WatchedItem.MediaType.valueOf(type.toUpperCase()),
            WatchedItem.WatchStatus.valueOf(status.toUpperCase())
        );
    }

    // Add a new watched item
    public WatchedItem addWatchedItem(WatchedItem item) throws Exception {
        // Check for duplicates by Anilist ID if provided
        if (item.getAnilistId() != null) {
            if (watchedItemsRepository.existsByUserIdAndAnilistId(item.getUserId(), item.getAnilistId())) {
                throw new Exception("Item already exists in watched list");
            }
        } else {
            // Check by title and type if no Anilist ID
            if (watchedItemsRepository.existsByUserIdAndTitleAndType(
                item.getUserId(), item.getTitle(), item.getType())) {
                throw new Exception("Item already exists in watched list");
            }
        }

        // Set default values
        if (item.getWatchedDate() == null) {
            item.setWatchedDate(LocalDateTime.now());
        }
        if (item.getStatus() == null) {
            item.setStatus(WatchedItem.WatchStatus.WATCHING);
        }

        return watchedItemsRepository.save(item);
    }

    // Update a watched item
    public WatchedItem updateWatchedItem(Long itemId, WatchedItem updatedItem) throws Exception {
        WatchedItem existingItem = watchedItemsRepository.findById(itemId)
            .orElseThrow(() -> new Exception("Watched item not found"));

        // Verify the item belongs to the user
        if (!existingItem.getUserId().equals(updatedItem.getUserId())) {
            throw new Exception("Unauthorized to update this item");
        }

        // Update fields
        if (updatedItem.getStatus() != null) {
            existingItem.setStatus(updatedItem.getStatus());
        }
        if (updatedItem.getEpisodesWatched() != null) {
            existingItem.setEpisodesWatched(updatedItem.getEpisodesWatched());
        }
        if (updatedItem.getTotalEpisodes() != null) {
            existingItem.setTotalEpisodes(updatedItem.getTotalEpisodes());
        }
        if (updatedItem.getChaptersRead() != null) {
            existingItem.setChaptersRead(updatedItem.getChaptersRead());
        }
        if (updatedItem.getTotalChapters() != null) {
            existingItem.setTotalChapters(updatedItem.getTotalChapters());
        }
        if (updatedItem.getRating() != null) {
            existingItem.setRating(updatedItem.getRating());
        }
        if (updatedItem.getNotes() != null) {
            existingItem.setNotes(updatedItem.getNotes());
        }
        if (updatedItem.getCompletedDate() != null) {
            existingItem.setCompletedDate(updatedItem.getCompletedDate());
        }

        return watchedItemsRepository.save(existingItem);
    }

    // Update progress (episodes or chapters)
    public WatchedItem updateProgress(Long userId, Integer anilistId, Integer progress) throws Exception {
        WatchedItem item = watchedItemsRepository.findByUserIdAndAnilistId(userId, anilistId);
        
        if (item == null) {
            throw new Exception("Watched item not found");
        }

        if (item.getType() == WatchedItem.MediaType.ANIME) {
            item.setEpisodesWatched(progress);
            // Auto-complete if all episodes watched
            if (item.getTotalEpisodes() != null && progress >= item.getTotalEpisodes()) {
                item.setStatus(WatchedItem.WatchStatus.COMPLETED);
                item.setCompletedDate(LocalDateTime.now());
            }
        } else {
            item.setChaptersRead(progress);
            // Auto-complete if all chapters read
            if (item.getTotalChapters() != null && progress >= item.getTotalChapters()) {
                item.setStatus(WatchedItem.WatchStatus.COMPLETED);
                item.setCompletedDate(LocalDateTime.now());
            }
        }

        return watchedItemsRepository.save(item);
    }

    // Remove a watched item
    public void removeWatchedItem(Long userId, Integer anilistId) throws Exception {
        WatchedItem existingItem = watchedItemsRepository.findByUserIdAndAnilistId(userId, anilistId);

        if (existingItem == null) {
            throw new Exception("Watched item not found");
        }

        watchedItemsRepository.delete(existingItem);
    }

    // Remove by ID
    public void removeWatchedItemById(Long userId, Long itemId) throws Exception {
        WatchedItem existingItem = watchedItemsRepository.findById(itemId)
            .orElseThrow(() -> new Exception("Watched item not found"));

        // Verify the item belongs to the user
        if (!existingItem.getUserId().equals(userId)) {
            throw new Exception("Unauthorized to delete this item");
        }

        watchedItemsRepository.delete(existingItem);
    }
}
