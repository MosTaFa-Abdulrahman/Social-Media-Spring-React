package com.mostafa.social.dto.story;

import java.time.LocalDateTime;

public record StoryResponseDTO(
        Integer id,
        String mediaUrl,
        LocalDateTime expiredAt,

        // User
        Integer userId,
        String username,
        String userFullName,
        String userImg
) {
}
