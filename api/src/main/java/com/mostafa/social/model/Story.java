package com.mostafa.social.model;


import com.mostafa.social.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "stories")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Story extends BaseEntity<Integer> {
    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    public void setExpirationTime() {
        if (this.expiredAt == null) {
            this.expiredAt = LocalDateTime.now().plusHours(24);
        }
    }


}
