package com.mostafa.social.repository;

import com.mostafa.social.model.Follow;
import com.mostafa.social.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface FollowRepo extends JpaRepository<Follow, Integer> {
    // Check if user1 follows user2
    boolean existsByFollowerAndFollowing(User follower, User following);

    // Find a specific follow relationship
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    // Count Followers
    long countByFollowing(User following);

    // Count Following
    long countByFollower(User follower);

    // Get all Followers with Pagination
    @Query("SELECT f.follower FROM Follow f WHERE f.following = :user")
    Page<User> findFollowersByUser(@Param("user") User user, Pageable pageable);

    // Get all Followings with Pagination
    @Query("SELECT f.following FROM Follow f WHERE f.follower = :user")
    Page<User> findFollowingByUser(@Param("user") User user, Pageable pageable);


}
