package com.mostafa.social.service;


import com.mostafa.social.dto.user.UpdateUserDTO;
import com.mostafa.social.dto.user.UserResponseDTO;
import com.mostafa.social.global.CustomResponseException;
import com.mostafa.social.mapper.EntityDtoMapper;
import com.mostafa.social.model.Follow;
import com.mostafa.social.model.User;
import com.mostafa.social.repository.FollowRepo;
import com.mostafa.social.repository.UserRepo;
import com.mostafa.social.utils.CurrentUser;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService {
    private final CurrentUser currentUser;
    private final UserRepo userRepo;
    private final FollowRepo followRepo;
    private final EntityDtoMapper mapper;
    private final NotificationService notificationService;


    // Helper method to check if current user follows target user
    private boolean checkIfUserIsFollowing(Integer currentUserId, Integer targetUserId) {
        if (currentUserId == null || currentUserId.equals(targetUserId)) {
            return false;
        }

        User currentUser = userRepo.findById(currentUserId).orElse(null);
        User targetUser = userRepo.findById(targetUserId).orElse(null);

        if (currentUser == null || targetUser == null) {
            return false;
        }

        return followRepo.existsByFollowerAndFollowing(currentUser, targetUser);
    }


    //    Update
    public UserResponseDTO updateUser(Integer userId, UpdateUserDTO dto) {
        User existingUser = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("User Not Found with This ID:  " + userId));

        existingUser.setFullName(dto.fullName());
        existingUser.setImgUrl(dto.imgUrl());
        existingUser.setCoverImgUrl(dto.coverImgUrl());
        existingUser.setCity(dto.city());

        User updatedUser = userRepo.save(existingUser);

        //  Get CurrentUser
        Integer currentUserId = currentUser.getCurrentUserId();
        // Check CurrentUser ((Follow or Not))
        boolean isFollowing = checkIfUserIsFollowing(currentUserId, updatedUser.getId());

        return mapper.toUserResponseDTO(updatedUser, isFollowing);
    }

    //    Delete ((userId))
    public String deleteByUserId(Integer userId) {
        userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("User Not Found with This ID:  " + userId));

        userRepo.deleteById(userId);

        return "User Deleted Success with this ID: " + userId;
    }

    //    Get All
    public Page<UserResponseDTO> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> usersPage = userRepo.findAll(pageable);

        Integer currentUserId = currentUser.getCurrentUserId();

        return usersPage.map(user -> {
            // Check CurrentUser ((Follow or Not))
            boolean isFollowing = checkIfUserIsFollowing(currentUserId, user.getId());

            return mapper.toUserResponseDTO(user, isFollowing);
        });
    }

    //    Get By ((userId)
    public UserResponseDTO getByUserId(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("User Not Found with This ID:  " + userId));

        Integer currentUserId = currentUser.getCurrentUserId();
        // Check CurrentUser ((Follow or Not))
        boolean isFollowing = checkIfUserIsFollowing(currentUserId, user.getId());

        return mapper.toUserResponseDTO(user, isFollowing);
    }


    // Get Suggested Users
    public Page<UserResponseDTO> getSuggestedUsers(int page, int size) {
        Integer currentUserId = currentUser.getCurrentUserId();
        if (currentUserId == null) {
            return getAllUsers(page, size);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<User> suggestedUsers = userRepo.findSuggestedUsers(currentUserId, pageable);

        return suggestedUsers.map(user ->
                mapper.toUserResponseDTO(user, false)
        );
    }

    //    ************************ ((Specifications)) ******************************** //
    // Follow User
    @Transactional
    public String followUser(Integer followingId) {
        // Get Current-User
        Integer followerId = currentUser.getCurrentUserId();
        if (followerId == null) {
            throw CustomResponseException.BadRequest("User must be authenticated to follow someone");
        }

        User follower = userRepo.findById(followerId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("Follower User Not Found with ID: " + followerId));
        User following = userRepo.findById(followingId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("Following User Not Found with ID: " + followingId));

        // Check if user is trying to follow themselves
        if (followerId.equals(followingId)) {
            throw CustomResponseException.BadRequest("User cannot follow themselves");
        }

        // Check if already following
        if (followRepo.existsByFollowerAndFollowing(follower, following)) {
            throw CustomResponseException.BadRequest("User is already following this user");
        }

        // Create Follow
        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();

        followRepo.save(follow);
        notificationService.createFollowNotification(following, follower);

        return "Successfully followed user: " + following.getUsername();
    }

    // Un-Follow User
    @Transactional
    public String unfollowUser(Integer followingId) {
        // Get Current-User
        Integer followerId = currentUser.getCurrentUserId();
        if (followerId == null) {
            throw CustomResponseException.BadRequest("User must be authenticated to follow someone");
        }

        User follower = userRepo.findById(followerId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("Follower User Not Found with ID: " + followerId));
        User following = userRepo.findById(followingId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("Following User Not Found with ID: " + followingId));

        // Check if follow relationship exists
        Follow follow = followRepo.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("Follow relationship does not exist"));

        // Delete follow relationship
        followRepo.delete(follow);

        return "Successfully unfollowed user: " + following.getUsername();
    }

    //    Get Followers Count BY ((userId))
    public long getFollowerCount(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("User Not Found with ID: " + userId));

        return followRepo.countByFollowing(user);
    }

    //    Get Followings Count BY ((userId))
    public long getFollowingCount(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("User Not Found with ID: " + userId));

        return followRepo.countByFollower(user);
    }

    //    Get All Followers
    public Page<UserResponseDTO> getAllFollowers(Integer userId, int page, int size) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("User Not Found with ID: " + userId));

        Pageable pageable = PageRequest.of(page, size);
        Page<User> followersPage = followRepo.findFollowersByUser(user, pageable);

        //  Get CurrentUser
        Integer currentUserId = currentUser.getCurrentUserId();

        return followersPage.map(follower -> {
            // Check CurrentUser ((Follow or Not))
            boolean isFollowing = checkIfUserIsFollowing(currentUserId, follower.getId());

            return mapper.toUserResponseDTO(follower, isFollowing);
        });
    }

    //    Get All Followings
    public Page<UserResponseDTO> getFollowing(Integer userId, int page, int size) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("User Not Found with ID: " + userId));

        Pageable pageable = PageRequest.of(page, size);
        Page<User> followingPage = followRepo.findFollowingByUser(user, pageable);


        //  Get CurrentUser
        Integer currentUserId = currentUser.getCurrentUserId();


        return followingPage.map(following -> {
            boolean isFollowing = checkIfUserIsFollowing(currentUserId, following.getId());

            return mapper.toUserResponseDTO(following, isFollowing);
        });
    }

}
