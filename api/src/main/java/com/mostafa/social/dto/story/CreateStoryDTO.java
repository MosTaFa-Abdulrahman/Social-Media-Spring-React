package com.mostafa.social.dto.story;

import jakarta.validation.constraints.NotNull;

public record CreateStoryDTO(
        @NotNull(message = "mediaUrl is required")
        String mediaUrl,


        @NotNull(message = "User ID is required")
        Integer userId
) {
}
