package com.example.AniLog.Profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    Follow getByFollowerIdAndFolloweeId(Long followerId, Long followeeId);
    Follow getByFollowerIdAndStatus(Long followerId, String status);
    void   deleteByFollowerIdAndFolloweeId(Long followerId, Long followeeId);
    List<Follow> getByFollowerId(Long followerId);
    List<Follow> getByFolloweeId(Long followeeId);
    Boolean existsByFollowerIdAndFolloweeId(Long followerId, Long followeeId);
}