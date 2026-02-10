package com.example;

import com.example.AniLog.Profile.Follow;
import com.example.AniLog.Profile.FollowRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@DataJpaTest
public class FollowRepositoryTest {
    @Autowired
    private FollowRepository followRepository;

    @Test
    public void testSaveAndFind() {
        Follow follow = new Follow();
        follow.setFollowerId(10L);
        follow.setFolloweeId(20L);
        follow.setStatus("FOLLOWING");
        follow = followRepository.save(follow);

        Follow found = followRepository.getByFollowerIdAndFolloweeId(10L, 20L);
        assertNotNull(found);
        assertEquals("FOLLOWING", found.getStatus());
    }

    @Test
    public void testDelete() {
        Follow follow = new Follow();
        follow.setFollowerId(11L);
        follow.setFolloweeId(21L);
        follow.setStatus("REQUESTED");
        follow = followRepository.save(follow);
        followRepository.deleteByFollowerIdAndFolloweeId(11L, 21L);
        assertNull(followRepository.getByFollowerIdAndFolloweeId(11L, 21L));
    }

    @Test
    public void testExists() {
        Follow follow = new Follow();
        follow.setFollowerId(12L);
        follow.setFolloweeId(22L);
        follow.setStatus("FOLLOWING");
        followRepository.save(follow);
        assertTrue(followRepository.existsByFollowerIdAndFolloweeId(12L, 22L));
    }

    @Test
    public void testFindByFollowerId() {
        Follow follow = new Follow();
        follow.setFollowerId(13L);
        follow.setFolloweeId(23L);
        follow.setStatus("FOLLOWING");
        followRepository.save(follow);
        List<Follow> follows = followRepository.getByFollowerId(13L);
        assertFalse(follows.isEmpty());
    }
}