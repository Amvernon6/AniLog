package com.example.AniLog.Profile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

public class FollowServiceTest {
    @Mock
    private FollowRepository followRepository;
    @Mock
    private PostgreSQLUserRepository userRepository;
    @InjectMocks
    private FollowService followService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        // Explicitly ensuring the service uses the mocked repositories
        followService = new FollowService(followRepository, userRepository);
    }

    @Test
    public void testFollowUserThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.followUser(1L, 2L));
    }

    @Test
    public void testFollowUserThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(new User()));
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.followUser(1L, 1L));
    }

    @Test
    public void testRequestUserThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.requestUser(1L, 2L));
    }

    @Test
    public void testRequestUserThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(new User()));
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.requestUser(1L, 1L));
    }

    @Test
    public void testUnfollowUserThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.unfollowUser(1L, 2L));
    }

    @Test
    public void testUnfollowUserThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(new User()));
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.unfollowUser(1L, 1L));
    }

    @Test
    public void testGetFollowingStatusesThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.getFollowingStatuses(1L));
    }

    @Test
    public void testAcceptFollowRequestThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.acceptFollowRequest(1L, 2L));
    }

    @Test
    public void testAcceptFollowRequestThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(new User()));
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.acceptFollowRequest(1L, 1L));
    }

    @Test
    public void testDenyFollowRequestThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.denyFollowRequest(1L, 2L));
    }

    @Test
    public void testDenyFollowRequestThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(new User()));
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> followService.denyFollowRequest(1L, 1L));
    }

    @Test
    public void testFollowUserSuccess() {
        // Must mock BOTH users if the service validates both IDs
        User mockUser1 = new User();
        User mockUser2 = new User();
        Long userId = 1L;
        Long targetUserId = 2L;
        mockUser1.setId(userId);
        mockUser2.setId(targetUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser1));
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser1));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(mockUser2));
        
        when(followRepository.existsByFollowerIdAndFolloweeId(userId, targetUserId)).thenReturn(true);
        doNothing().when(followRepository).deleteByFollowerIdAndFolloweeId(userId, targetUserId);
        when(followRepository.save(any(Follow.class))).thenReturn(new Follow());
        
        assertDoesNotThrow(() -> followService.followUser(userId, targetUserId));
    }

    @Test
    public void testRequestUserSuccess() {
        User mockUser1 = new User();
        User mockUser2 = new User();
        Long userId = 1L;
        Long targetUserId = 2L;
        mockUser1.setId(userId);
        mockUser2.setId(targetUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser1));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(mockUser2));
        
        when(followRepository.existsByFollowerIdAndFolloweeId(userId, targetUserId)).thenReturn(false);
        doNothing().when(followRepository).deleteByFollowerIdAndFolloweeId(userId, targetUserId);
        when(followRepository.save(any(Follow.class))).thenReturn(new Follow());
        
        assertDoesNotThrow(() -> followService.requestUser(userId, targetUserId));
    }

    @Test
    public void testUnfollowUserSuccess() {
        User mockUser1 = new User();
        User mockUser2 = new User();
        Long userId = 1L;
        Long targetUserId = 2L;
        mockUser1.setId(userId);
        mockUser2.setId(targetUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser1));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(mockUser2));
        
        doNothing().when(followRepository).deleteByFollowerIdAndFolloweeId(userId, targetUserId);
        
        assertDoesNotThrow(() -> followService.unfollowUser(userId, targetUserId));
    }

    @Test
    public void testGetFollowingStatuses() {
        User mockUser1 = new User();
        Long userId = 1L;
        mockUser1.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser1));
        
        List<Follow> following = new ArrayList<>();
        List<Follow> followers = new ArrayList<>();
        following.add(new Follow());
        followers.add(new Follow());
        
        when(followRepository.getByFollowerId(userId)).thenReturn(following);
        when(followRepository.getByFolloweeId(userId)).thenReturn(followers);
        
        List<Follow> result = followService.getFollowingStatuses(userId);
        assertEquals(2, result.size());
    }

    @Test
    public void testAcceptFollowRequest() {
        User mockUser1 = new User();
        User mockUser2 = new User();
        Long userId = 1L;
        Long targetUserId = 2L;
        mockUser1.setId(userId);
        mockUser2.setId(targetUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser1));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(mockUser2));
        
        Follow follow = new Follow();
        follow.setStatus("REQUESTED");
        
        // Note: Accepting a request usually involves the person being followed (1L) 
        // accepting a request FROM (2L). Verify ID order in your service logic.
        when(followRepository.findByFollowerIdAndFolloweeId(targetUserId, userId)).thenReturn(follow);
        when(followRepository.save(any(Follow.class))).thenReturn(follow);
        
        assertDoesNotThrow(() -> followService.acceptFollowRequest(userId, targetUserId));
    }

    @Test
    public void testDenyFollowRequest() {
        User mockUser1 = new User();
        User mockUser2 = new User();
        Long userId = 1L;
        Long targetUserId = 2L;
        mockUser1.setId(userId);
        mockUser2.setId(targetUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser1));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(mockUser2));
        
        Follow follow = new Follow();
        follow.setStatus("REQUESTED");
        
        when(followRepository.findByFollowerIdAndFolloweeId(targetUserId, userId)).thenReturn(follow);
        doNothing().when(followRepository).deleteByFollowerIdAndFolloweeId(targetUserId, userId);
        
        assertDoesNotThrow(() -> followService.denyFollowRequest(userId, targetUserId));
    }
}