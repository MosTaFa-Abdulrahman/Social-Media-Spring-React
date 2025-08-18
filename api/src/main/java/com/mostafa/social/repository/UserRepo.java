package com.mostafa.social.repository;

import com.mostafa.social.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserRepo extends JpaRepository<User, Integer> {
    //    Find User By ((Email))
    Optional<User> findByEmail(String email);


    // Find ((Suggested-Users))
    @Query("SELECT u FROM User u WHERE u.id != :currentUserId AND u.id NOT IN " +
            "(SELECT f.following.id FROM Follow f WHERE f.follower.id = :currentUserId)")
    Page<User> findSuggestedUsers(@Param("currentUserId") Integer currentUserId, Pageable pageable);


}
