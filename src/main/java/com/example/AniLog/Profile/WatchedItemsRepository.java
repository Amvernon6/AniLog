package com.example.AniLog.Profile;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatchedItemsRepository extends JpaRepository<WatchedItem, Long> {
    
    // Find all watched items for a specific user
    List<WatchedItem> findByUserId(Long userId);
    
    // Find watched items by user and type (ANIME or MANGA)
    List<WatchedItem> findByUserIdAndType(Long userId, WatchedItem.MediaType type);

    // Find watched items by user and status
    List<WatchedItem> findByUserIdAndStatus(Long userId, WatchedItem.WatchStatus status);

    // Find watched items by user, type, and status
    List<WatchedItem> findByUserIdAndTypeAndStatus(Long userId, WatchedItem.MediaType type, WatchedItem.WatchStatus status);

    // Find a specific item by user, title, and type
    WatchedItem findByUserIdAndTitleAndType(Long userId, String title, WatchedItem.MediaType type);

    // Check if user already has this item in their watched list
    boolean existsByUserIdAndTitleAndType(Long userId, String title, WatchedItem.MediaType type);

    // Find a specific item by user and Anilist ID
    WatchedItem findByUserIdAndAnilistId(Long userId, Integer anilistId);

    // Check if user already has this item by Anilist ID
    boolean existsByUserIdAndAnilistId(Long userId, Integer anilistId);

    // Find all completed items for a user
    List<WatchedItem> findByUserIdAndStatusOrderByCompletedDateDesc(Long userId, WatchedItem.WatchStatus status);

    // Find items by user ordered by watch date
    List<WatchedItem> findByUserIdOrderByWatchedDateDesc(Long userId);
}
