package com.mostafa.social.repository;

import com.mostafa.social.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface NotificationRepo extends JpaRepository<Notification, Integer> {
    //    Get All (Notifications-> (Read,unRead))   For ((Specific-User))
    Page<Notification> findByUserIdOrderByCreatedDateDesc(Integer userId, Pageable pageable);
    
    //    Get unRead Counts
    long countByUserIdAndIsReadFalse(Integer userId);

    //    Make All Read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsReadByUserId(@Param("userId") Integer userId);

    //    Make ((Specific-Notification)) Read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId AND n.user.id = :userId")
    void markAsReadByIdAndUserId(@Param("notificationId") Integer notificationId, @Param("userId") Integer userId);


}
