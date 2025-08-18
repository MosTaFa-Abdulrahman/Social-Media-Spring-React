package com.mostafa.social.dto.reply;

import java.time.LocalDateTime;


public record ReplyResponseDTO(
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


        // Comment
        Integer commentId

) {
}
