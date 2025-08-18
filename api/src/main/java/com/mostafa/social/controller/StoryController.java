package com.mostafa.social.controller;


import com.mostafa.social.dto.story.CreateStoryDTO;
import com.mostafa.social.dto.story.StoryResponseDTO;
import com.mostafa.social.global.GlobalResponse;
import com.mostafa.social.service.StoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stories")
public class StoryController {
    private final StoryService storyService;


    //    Create
    @PostMapping
    public ResponseEntity<GlobalResponse<StoryResponseDTO>> createStory(
            @Valid @RequestBody CreateStoryDTO createStoryDTO) {
        StoryResponseDTO story = storyService.createStory(createStoryDTO);
        GlobalResponse<StoryResponseDTO> res = new GlobalResponse<>(story);


        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    //    Delete
    @DeleteMapping("/{storyId}")
    public ResponseEntity<GlobalResponse<String>> deleteStory(@PathVariable Integer storyId) {
        String deletedStory = storyService.deleteStory(storyId);
        GlobalResponse<String> res = new GlobalResponse<>(deletedStory);


        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    //    Get All
    @GetMapping
    public ResponseEntity<GlobalResponse<List<StoryResponseDTO>>> getAllActiveStories() {
        List<StoryResponseDTO> stories = storyService.getAllActiveStories();
        GlobalResponse<List<StoryResponseDTO>> res = new GlobalResponse<>(stories);


        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    //    Get Single
    @GetMapping("/{storyId}")
    public ResponseEntity<GlobalResponse<StoryResponseDTO>> getSingle(@PathVariable Integer storyId) {
        StoryResponseDTO story = storyService.getSingle(storyId);
        GlobalResponse<StoryResponseDTO> res = new GlobalResponse<>(story);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }


}
