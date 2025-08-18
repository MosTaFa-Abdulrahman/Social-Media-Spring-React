package com.mostafa.social.dto.comment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record CreateCommentDTO(
        @NotNull(message = "Text is required")
        @Size(max = 1600, message = "Text cannot exceed 1600 characters")
        String text,


        @NotNull(message = "User ID is required")
        Integer userId,
        @NotNull(message = "Post ID is required")
        Integer postId
) {
}
