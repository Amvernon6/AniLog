package com.example.AniLog.Profile;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListService {
    ListsRepository listsRepository;
    
    public ListService(ListsRepository listsRepository) {
        this.listsRepository = listsRepository;
    }

    public List<UserListItem> getUserList(Long userId, String listType) {
        return listsRepository.findByUserIdAndType(userId, UserListItem.MediaType.valueOf(listType.toUpperCase()));
    }

    public UserListItem addItemToList(UserListItem item) throws Exception {
        // Check for duplicates
        if (listsRepository.existsByUserIdAndTitleAndType(item.getUserId(), item.getTitle(), item.getType())) {
            throw new Exception("Item already exists in the user's list");
        }

        item.setUserId(item.getUserId());
        item.setType(item.getType());
        item.setTitle(item.getTitle());
        item.setCoverImageUrl(item.getCoverImageUrl());
        item.setAnilistId(item.getAnilistId());
        item.setAddedDate(java.time.LocalDateTime.now());

        return listsRepository.save(item);
    }

    public void removeItemFromList(UserListItem item) throws Exception {
        UserListItem existingItem = listsRepository.findByUserIdAndTitleAndType(
            item.getUserId(), item.getTitle(), item.getType()
        );

        if (existingItem == null) {
            throw new Exception("Item not found in the user's list");
        }

        listsRepository.delete(existingItem);
    }
}
