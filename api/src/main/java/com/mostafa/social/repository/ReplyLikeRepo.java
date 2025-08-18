package com.mostafa.social.repository;


import com.mostafa.social.model.ReplyLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ReplyLikeRepo extends JpaRepository<ReplyLike, Integer> {
    // Check if user already liked the reply
    Optional<ReplyLike> findByUserIdAndReplyId(Integer userId, Integer replyId);

    // Count likes for a specific reply
    @Query("SELECT COUNT(rl) FROM ReplyLike rl WHERE rl.reply.id = :replyId")
    Long countLikesByReplyId(@Param("replyId") Integer replyId);


}
