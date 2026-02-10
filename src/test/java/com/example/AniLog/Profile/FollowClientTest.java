package com.example.AniLog.Profile;

import com.example.AniLog.Profile.FollowClient;
import com.example.AniLog.Profile.FollowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Collections;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class FollowClientTest {
    @Mock
    private FollowService followService;
    @InjectMocks
    private FollowClient followClient;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        followClient = new FollowClient(followService);
    }

    @Test
    public void testFollowUserSuccess() {
        doNothing().when(followService).followUser(1L, 2L);
        ResponseEntity<String> response = followClient.followUser(1L, 2L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User followed successfully", response.getBody());
    }

    @Test
    public void testRequestUserSuccess() {
        doNothing().when(followService).requestUser(1L, 2L);
        ResponseEntity<String> response = followClient.requestUser(1L, 2L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Follow request sent successfully", response.getBody());
    }

    @Test
    public void testUnfollowUserSuccess() {
        doNothing().when(followService).unfollowUser(1L, 2L);
        ResponseEntity<String> response = followClient.unfollowUser(1L, 2L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User unfollowed successfully", response.getBody());
    }

    @Test
    public void testGetFollowingStatuses() {
        when(followService.getFollowingStatuses(1L)).thenReturn(Collections.emptyList());
        ResponseEntity<?> response = followClient.getFollowingStatuses(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof java.util.List);
    }

    @Test
    public void testAcceptFollowRequest() {
        doNothing().when(followService).acceptFollowRequest(1L, 2L);
        ResponseEntity<String> response = followClient.acceptFollowRequest(1L, 2L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Follow request accepted successfully", response.getBody());
    }

    @Test
    public void testDeclineFollowRequest() {
        doNothing().when(followService).denyFollowRequest(1L, 2L);
        ResponseEntity<String> response = followClient.declineFollowRequest(1L, 2L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Follow request declined successfully", response.getBody());
    }
}