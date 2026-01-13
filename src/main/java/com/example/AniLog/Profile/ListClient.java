package com.example.AniLog.Profile;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class ListClient {
    
    private final ListService listService;

    public ListClient(ListService listService) {
        this.listService = listService;
    }

    @GetMapping("/{userId}/list/{listType}")
    public ResponseEntity<?> getList(@PathVariable Long userId, @PathVariable String listType) {
        if (userId == null || listType == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID and list type are required"));
        }

        if (!listType.equalsIgnoreCase("ANIME") && !listType.equalsIgnoreCase("MANGA")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("List type must be either 'ANIME' or 'MANGA'"));
        }
        
        return ResponseEntity.ok().body(listService.getUserList(userId, listType));
    }

    @PostMapping("/list/add")
    public ResponseEntity<?> addItemToList(@RequestBody UserListItem item) {
        if (item == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Item data is required"));
        }

        if (item.getUserId() == null || item.getType() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID and list type are required"));
        }

        if (!item.getType().name().equalsIgnoreCase("ANIME") && !item.getType().name().equalsIgnoreCase("MANGA")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("List type must be either 'ANIME' or 'MANGA'"));
        }

        try {
            UserListItem addedItem = listService.addItemToList(item);
            return ResponseEntity.ok().body(addedItem);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to add item to list: " + e.getMessage()));
        }
    }   

    @DeleteMapping("/list/remove")
    public ResponseEntity<?> removeItemFromList(@RequestBody UserListItem item) {
        if (item == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Item data is required"));
        }

        if (item.getUserId() == null || item.getAnilistId() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User ID and Anilist ID are required"));
        }

        try {
            listService.removeItemFromList(item);
            return ResponseEntity.ok().body(new SuccessResponse("Item removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to remove item from list: " + e.getMessage()));
        }
    }
}
