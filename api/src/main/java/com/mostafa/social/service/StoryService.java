package com.mostafa.social.service;


import com.mostafa.social.dto.story.CreateStoryDTO;
import com.mostafa.social.dto.story.StoryResponseDTO;
import com.mostafa.social.global.CustomResponseException;
import com.mostafa.social.mapper.EntityDtoMapper;
import com.mostafa.social.model.Story;
import com.mostafa.social.model.User;
import com.mostafa.social.repository.StoryRepo;
import com.mostafa.social.repository.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class StoryService {
    private final StoryRepo storyRepo;
    private final UserRepo userRepo;
    private final EntityDtoMapper mapper;


    //    Create
    @Transactional
    public StoryResponseDTO createStory(CreateStoryDTO dto) {
        // Find user
        User user = userRepo.findById(dto.userId())
                .orElseThrow(() -> CustomResponseException
                        .ResourceNotFound("User not found with id: " + dto.userId()));

        // Create story
        Story story = Story.builder()
                .mediaUrl(dto.mediaUrl())
                .user(user)
                .build();

        // Save story (expiredAt will be set by @PrePersist to 24h from now)
        Story savedStory = storyRepo.save(story);

        return mapper.toStoryResponseDTO(savedStory);
    }


    //    Get All ((Active Stories))
    @Transactional
    public List<StoryResponseDTO> getAllActiveStories() {
        List<Story> activeStories = storyRepo.findActiveStories(LocalDateTime.now());

        return activeStories.stream()
                .map(mapper::toStoryResponseDTO)
                .collect(Collectors.toList());
    }

    //    Get Single
    public StoryResponseDTO getSingle(Integer storyId) {
        Story story = storyRepo.findById(storyId).
                orElseThrow(() -> CustomResponseException.ResourceNotFound("Story not found with this ID: " + storyId));

        return mapper.toStoryResponseDTO(story);
    }


    //    Delete
    public String deleteStory(Integer storyId) {
        Story story = storyRepo.findById(storyId).
                orElseThrow(() -> CustomResponseException.ResourceNotFound("Story not found with this ID: " + storyId));

        storyRepo.delete(story);

        return "Story Deleted Success !!";
    }

    // *************************** ((Automatic Deletion)) ***************************** //
    // Automatic cleanup - runs every hour
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    @Transactional
    public void cleanupExpiredStories() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = storyRepo.deleteExpiredStories(now);
//        System.out.println("Cleaned up " + deletedCount + " expired stories at " + now);
    }

    // Manual cleanup method
    @Transactional
    public int manualCleanupExpiredStories() {
        return storyRepo.deleteExpiredStories(LocalDateTime.now());
    }


}
