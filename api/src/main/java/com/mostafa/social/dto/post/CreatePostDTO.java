package com.mostafa.social.dto.post;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePostDTO(
        @NotNull(message = "Title is required")
        @Size(max = 100, message = "Title cannot exceed 100 characters")
        String title,

        @Size(max = 700, message = "Description cannot exceed 700 characters")
        String description,
        
        String imageUrl,


        @NotNull(message = "User ID is required")
        Integer userId
) {
}
