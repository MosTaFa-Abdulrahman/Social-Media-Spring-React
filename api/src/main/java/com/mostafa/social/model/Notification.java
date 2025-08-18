package com.mostafa.social.model;


import com.mostafa.social.base.BaseEntity;
import com.mostafa.social.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "notifications")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Notification extends BaseEntity<Integer> {
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "is_read", nullable = false)
    @Builder.Default  // This ensures the default value is used in the builder
    private Boolean isRead = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;


    @Column(name = "reference_id")
    private Integer referenceId; // ID of the ((post/comment/reply/user))


    //    RelationShips
    // User who receives the notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // User who triggered the notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by_user_id", nullable = false)
    private User triggeredByUser;


}
