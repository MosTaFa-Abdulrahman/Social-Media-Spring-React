package com.mostafa.social.repository;

import com.mostafa.social.model.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface PostLikeRepo extends JpaRepository<PostLike, Integer> {
    // Check if user already liked the post
    Optional<PostLike> findByUserIdAndPostId(Integer userId, Integer postId);

    // Count likes for a specific post
    @Query("SELECT COUNT(pl) FROM PostLike pl WHERE pl.post.id = :postId")
    Long countLikesByPostId(@Param("postId") Integer postId);


}
