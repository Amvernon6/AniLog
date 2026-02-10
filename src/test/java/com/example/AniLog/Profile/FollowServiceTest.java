package com.example.AniLog.Profile;

import java.util.ArrayList;
import java.util.List;

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
        when(userRepository.findById(1L)).thenReturn(null);
        assertThrows(IllegalArgumentException.class, () -> followService.followUser(1L, 2L));
    }

    @Test
    public void testFollowUserThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(new User());
        assertThrows(IllegalArgumentException.class, () -> followService.followUser(1L, 1L));
    }

    @Test
    public void testRequestUserThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(null);
        assertThrows(IllegalArgumentException.class, () -> followService.requestUser(1L, 2L));
    }

    @Test
    public void testRequestUserThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(new User());
        assertThrows(IllegalArgumentException.class, () -> followService.requestUser(1L, 1L));
    }

    @Test
    public void testUnfollowUserThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(null);
        assertThrows(IllegalArgumentException.class, () -> followService.unfollowUser(1L, 2L));
    }

    @Test
    public void testUnfollowUserThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(new User());
        assertThrows(IllegalArgumentException.class, () -> followService.unfollowUser(1L, 1L));
    }

    @Test
    public void testGetFollowingStatusesThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(null);
        assertThrows(IllegalArgumentException.class, () -> followService.getFollowingStatuses(1L));
    }

    @Test
    public void testAcceptFollowRequestThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(null);
        assertThrows(IllegalArgumentException.class, () -> followService.acceptFollowRequest(1L, 2L));
    }

    @Test
    public void testAcceptFollowRequestThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(new User());
        assertThrows(IllegalArgumentException.class, () -> followService.acceptFollowRequest(1L, 1L));
    }

    @Test
    public void testDenyFollowRequestThrowsIfUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(null);
        assertThrows(IllegalArgumentException.class, () -> followService.denyFollowRequest(1L, 2L));
    }

    @Test
    public void testDenyFollowRequestThrowsIfSelfFollow() {
        when(userRepository.findById(1L)).thenReturn(new User());
        assertThrows(IllegalArgumentException.class, () -> followService.denyFollowRequest(1L, 1L));
    }

    @Test
    public void testFollowUserSuccess() {
        // Must mock BOTH users if the service validates both IDs
        when(userRepository.findById(1L)).thenReturn(new User());
        when(userRepository.findById(2L)).thenReturn(new User());
        
        when(followRepository.existsByFollowerIdAndFolloweeId(1L, 2L)).thenReturn(true);
        doNothing().when(followRepository).deleteByFollowerIdAndFolloweeId(1L, 2L);
        when(followRepository.save(any(Follow.class))).thenReturn(new Follow());
        
        assertDoesNotThrow(() -> followService.followUser(1L, 2L));
    }

    @Test
    public void testRequestUserSuccess() {
        when(userRepository.findById(1L)).thenReturn(new User());
        when(userRepository.findById(2L)).thenReturn(new User());
        
        when(followRepository.existsByFollowerIdAndFolloweeId(1L, 2L)).thenReturn(false);
        doNothing().when(followRepository).deleteByFollowerIdAndFolloweeId(1L, 2L);
        when(followRepository.save(any(Follow.class))).thenReturn(new Follow());
        
        assertDoesNotThrow(() -> followService.requestUser(1L, 2L));
    }

    @Test
    public void testUnfollowUserSuccess() {
        when(userRepository.findById(1L)).thenReturn(new User());
        when(userRepository.findById(2L)).thenReturn(new User());
        
        doNothing().when(followRepository).deleteByFollowerIdAndFolloweeId(1L, 2L);
        
        assertDoesNotThrow(() -> followService.unfollowUser(1L, 2L));
    }

    @Test
    public void testGetFollowingStatuses() {
        when(userRepository.findById(1L)).thenReturn(new User());
        
        List<Follow> following = new ArrayList<>();
        List<Follow> followers = new ArrayList<>();
        following.add(new Follow());
        followers.add(new Follow());
        
        when(followRepository.getByFollowerId(1L)).thenReturn(following);
        when(followRepository.getByFolloweeId(1L)).thenReturn(followers);
        
        List<Follow> result = followService.getFollowingStatuses(1L);
        assertEquals(2, result.size());
    }

    @Test
    public void testAcceptFollowRequest() {
        when(userRepository.findById(1L)).thenReturn(new User());
        when(userRepository.findById(2L)).thenReturn(new User());
        
        Follow follow = new Follow();
        follow.setStatus("REQUESTED");
        
        // Note: Accepting a request usually involves the person being followed (1L) 
        // accepting a request FROM (2L). Verify ID order in your service logic.
        when(followRepository.findByFollowerIdAndFolloweeId(2L, 1L)).thenReturn(follow);
        when(followRepository.save(any(Follow.class))).thenReturn(follow);
        
        assertDoesNotThrow(() -> followService.acceptFollowRequest(1L, 2L));
    }

    @Test
    public void testDenyFollowRequest() {
        when(userRepository.findById(1L)).thenReturn(new User());
        when(userRepository.findById(2L)).thenReturn(new User());
        
        Follow follow = new Follow();
        follow.setStatus("REQUESTED");
        
        when(followRepository.findByFollowerIdAndFolloweeId(2L, 1L)).thenReturn(follow);
        doNothing().when(followRepository).deleteByFollowerIdAndFolloweeId(2L, 1L);
        
        assertDoesNotThrow(() -> followService.denyFollowRequest(1L, 2L));
    }
}