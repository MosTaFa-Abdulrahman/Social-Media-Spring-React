package com.mostafa.social.repository;

import com.mostafa.social.model.Story;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface StoryRepo extends JpaRepository<Story, Integer> {
    @Query("SELECT s FROM Story s WHERE s.expiredAt > :currentTime ORDER BY s.id DESC")
    List<Story> findActiveStories(LocalDateTime currentTime);

    @Modifying
    @Transactional
    @Query("DELETE FROM Story s WHERE s.expiredAt <= :currentTime")
    int deleteExpiredStories(LocalDateTime currentTime);

}
