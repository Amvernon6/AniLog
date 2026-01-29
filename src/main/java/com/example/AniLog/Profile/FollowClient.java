package com.example.AniLog.Profile;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class FollowClient {
    private final FollowService followService;

    public FollowClient(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/{userId}/follow/{targetUserId}")
    public ResponseEntity<String> followUser(@PathVariable Long userId, @PathVariable Long targetUserId) {
        try {
            followService.followUser(userId, targetUserId);
            return ResponseEntity.ok("User followed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/{userId}/request/{targetUserId}")
    public ResponseEntity<String> requestUser(@PathVariable Long userId, @PathVariable Long targetUserId) {
        try {
            followService.requestUser(userId, targetUserId);
            return ResponseEntity.ok("Follow request sent successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}/unfollow/{targetUserId}")
    public ResponseEntity<String> unfollowUser(@PathVariable Long userId, @PathVariable Long targetUserId) {
        try {
            followService.unfollowUser(userId, targetUserId);
            return ResponseEntity.ok("User unfollowed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{userId}/followStatuses")
    public ResponseEntity<List<Follow>> getFollowingStatuses(@PathVariable Long userId) {
        try {
            List<Follow> follows = followService.getFollowingStatuses(userId);
            return ResponseEntity.ok(follows);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // @PostMapping("/{userId}/block/{targetUserId}")
    // public void blockUser(@PathVariable Long userId, @PathVariable Long targetUserId) {
    //     followService.blockUser(userId, targetUserId);
    // }
}