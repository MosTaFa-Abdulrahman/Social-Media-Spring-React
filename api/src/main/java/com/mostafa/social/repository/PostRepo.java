package com.mostafa.social.repository;

import com.mostafa.social.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface PostRepo extends JpaRepository<Post, Integer> {
    //    Get All Posts for ((Specific-User))
    Page<Post> findByUserId(@Param("userId") Integer userId, Pageable pageable);

}
