package com.mostafa.social.controller;


import com.mostafa.social.dto.PaginatedResponse;
import com.mostafa.social.dto.notification.NotificationDTO;
import com.mostafa.social.global.GlobalResponse;
import com.mostafa.social.service.NotificationService;
import com.mostafa.social.utils.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final CurrentUser currentUser;


    //    Get All for ((Current-User))
    @GetMapping
    public ResponseEntity<GlobalResponse<PaginatedResponse<NotificationDTO>>> getUserNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest req
    ) {
        Integer currentUserId = currentUser.getCurrentUserId();
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(currentUserId, page - 1, size);

        String baseUrl = req.getRequestURL().toString();
        String nextUrl = notifications.hasNext() ? String.format("%s?page=%d&size=%d", baseUrl, page + 1, size) : null;
        String prevUrl = notifications.hasPrevious() ? String.format("%s?page=%d&size=%d", baseUrl, page - 1, size) : null;

        var paginatedResponse = new PaginatedResponse<NotificationDTO>(
                notifications.getContent(),
                notifications.getNumber() + 1,
                notifications.getTotalPages(),
                notifications.getTotalElements(),
                notifications.hasNext(),
                notifications.hasPrevious(),
                nextUrl,
                prevUrl
        );

        return new ResponseEntity<>(new GlobalResponse<>(paginatedResponse), HttpStatus.OK);
    }

    //    Delete
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<GlobalResponse<String>> deleteSingle(@PathVariable Integer notificationId) {
        String deletedNotification = notificationService.deleteNotification(notificationId);
        GlobalResponse<String> res = new GlobalResponse<>(deletedNotification);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    //    Get Count ((unRead-Notifications))
    @GetMapping("/unread-count")
    public ResponseEntity<GlobalResponse<Long>> getUnreadCount() {
        Integer userId = currentUser.getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);

        return new ResponseEntity<>(new GlobalResponse<>(count), HttpStatus.OK);
    }

    //    Make read
    @PutMapping("/read/{id}")
    public ResponseEntity<GlobalResponse<String>> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);

        return new ResponseEntity<>(new GlobalResponse<>("Notification marked as read"), HttpStatus.OK);
    }

    //    Make all reads
    @PutMapping("/read-all")
    public ResponseEntity<GlobalResponse<String>> markAllAsRead() {
        notificationService.markAllAsRead();


        return new ResponseEntity<>(new GlobalResponse<>("All notifications marked as read"), HttpStatus.OK);
    }


}
