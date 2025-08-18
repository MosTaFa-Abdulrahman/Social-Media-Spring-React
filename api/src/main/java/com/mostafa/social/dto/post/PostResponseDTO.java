package com.mostafa.social.dto.post;

import java.time.LocalDateTime;


public record PostResponseDTO(
        Integer id,
        String title,
        String description,
        String imageUrl,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate,


        // Likes
        Long likesCount,

        // User
        Integer userId,
        String username,
        String userImg,
        String userFullName,
        Boolean isLikedByCurrentUser


) {
}
