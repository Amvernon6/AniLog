package com.example.AniLog.Profile;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ListsRepository extends JpaRepository<UserListItem, Long> {
    
    // Find all lists for a specific user
    List<UserListItem> findByUserId(Long userId);
    
    // Find lists by user and type (ANIME or MANGA)
    List<UserListItem> findByUserIdAndType(Long userId, UserListItem.MediaType type);

    // Find a specific item by user, title, and type
    UserListItem findByUserIdAndTitleAndType(Long userId, String title, UserListItem.MediaType type);

    // Check if user already has this item in their list
    boolean existsByUserIdAndTitleAndType(Long userId, String title, UserListItem.MediaType type);

    // Find a specific item by user and Anilist ID
    UserListItem findByUserIdAndAnilistId(Long userId, Integer anilistId);
}
