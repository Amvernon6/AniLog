package com.example.AniLog.Profile;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;

@Service
@Transactional
public class FollowService {
    private final FollowRepository followRepository;
    private final PostgreSQLUserRepository userRepository;

    public FollowService(FollowRepository followRepository, PostgreSQLUserRepository userRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    public void followUser(Long userId, Long targetUserId) {
        if (userId == null || targetUserId == null) {
            throw new IllegalArgumentException("User IDs cannot be null");
        } else if (userId.equals(targetUserId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        } else if (userRepository.findById(userId).isEmpty() || userRepository.findById(targetUserId).isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        // Logic to change the follow relationship
        if (followRepository.existsByFollowerIdAndFolloweeId(userId, targetUserId)) {
            followRepository.deleteByFollowerIdAndFolloweeId(userId, targetUserId);
            Follow follow = new Follow();
            follow.setFollowerId(userId);
            follow.setFolloweeId(targetUserId);
            follow.setStatus("FOLLOWING");
            followRepository.save(follow);
        }
    }

    public void requestUser(Long userId, Long targetUserId) {
        if (userId == null || targetUserId == null) {
            throw new IllegalArgumentException("User IDs cannot be null");
        } else if (userId.equals(targetUserId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        } else if (userRepository.findById(userId).isEmpty() || userRepository.findById(targetUserId).isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        // Logic to change the follow relationship
        if (!followRepository.existsByFollowerIdAndFolloweeId(userId, targetUserId)) {
            followRepository.deleteByFollowerIdAndFolloweeId(userId, targetUserId);
            Follow follow = new Follow();
            follow.setFollowerId(userId);
            follow.setFolloweeId(targetUserId);
            follow.setStatus("REQUESTED");
            followRepository.save(follow);
        } else {
            throw new IllegalArgumentException("Already Requested this user or blocked");
        }
    }

    public void unfollowUser(Long userId, Long targetUserId) {
        if (userId == null || targetUserId == null) {
            throw new IllegalArgumentException("User IDs cannot be null");
        } else if (userId.equals(targetUserId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        } else if (userRepository.findById(userId).isEmpty() || userRepository.findById(targetUserId).isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        // Logic to add the follow relationship
        followRepository.deleteByFollowerIdAndFolloweeId(userId, targetUserId);
    }

    public List<Follow> getFollowingStatuses(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        } else if (userRepository.findById(userId).isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        List<Follow> following = followRepository.getByFollowerId(userId);
        List<Follow> followers = followRepository.getByFolloweeId(userId);
        List<Follow> allFollows = new ArrayList<>();
        allFollows.addAll(following);
        allFollows.addAll(followers);
        return allFollows;
    }

    public void acceptFollowRequest(Long userId, Long targetUserId) {
        if (userId == null || targetUserId == null) {
            throw new IllegalArgumentException("User IDs cannot be null");
        } else if (userId.equals(targetUserId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        } else if (userRepository.findById(userId).isEmpty() || userRepository.findById(targetUserId).isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        // Logic to change the follow relationship
        Follow follow = followRepository.findByFollowerIdAndFolloweeId(targetUserId, userId);
        if (follow != null && "REQUESTED".equals(follow.getStatus())) {
            follow.setStatus("FOLLOWING");
            followRepository.save(follow);
        } else {
            throw new IllegalArgumentException("No follow request found to accept");
        }
    }

    public void denyFollowRequest(Long userId, Long targetUserId) {
        if (userId == null || targetUserId == null) {
            throw new IllegalArgumentException("User IDs cannot be null");
        } else if (userId.equals(targetUserId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        } else if (userRepository.findById(userId).isEmpty() || userRepository.findById(targetUserId).isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        // Logic to change the follow relationship
        Follow follow = followRepository.findByFollowerIdAndFolloweeId(targetUserId, userId);
        if (follow != null && "REQUESTED".equals(follow.getStatus())) {
            followRepository.deleteByFollowerIdAndFolloweeId(targetUserId, userId);
        } else {
            throw new IllegalArgumentException("No follow request found to deny");
        }
    }

    // public void blockUser(Long userId, Long targetUserId) {
    //     // Logic to block a user
    // }
}
