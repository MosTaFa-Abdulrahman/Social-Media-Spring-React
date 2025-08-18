package com.mostafa.social.repository;

import com.mostafa.social.model.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface CommentLikeRepo extends JpaRepository<CommentLike, Integer> {
    // Check if user already liked the comment
    Optional<CommentLike> findByUserIdAndCommentId(Integer userId, Integer commentId);

    // Count likes for a specific comment
    @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.comment.id = :commentId")
    Long countLikesByCommentId(@Param("commentId") Integer commentId);
}
