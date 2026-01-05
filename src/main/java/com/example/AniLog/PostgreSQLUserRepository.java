package com.example.AniLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostgreSQLUserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
