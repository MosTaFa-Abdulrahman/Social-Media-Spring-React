package com.mostafa.social.dto.comment;


import java.time.LocalDateTime;


public record CommentResponseDTO(
        Integer id,
        String text,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate,

        // Likes
        Long likesCount,
        // User
        Integer userId,
        String username,
        String userImg,
        Boolean isLikedByCurrentUser,

        // Post
        Integer postId,
        String postTitle
) {
}
