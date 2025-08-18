package com.mostafa.social.dto.notification;

import com.mostafa.social.enums.NotificationType;

import java.time.LocalDateTime;


public record NotificationDTO(
        Integer id,
        String title,
        String message,
        Boolean isRead,
        NotificationType type,
        LocalDateTime createdDate,
        Integer referenceId,


        // User
        Integer userId,
        String username,
        String userEmail,
        String userImgUrl,
        String userFullName
) {
}
