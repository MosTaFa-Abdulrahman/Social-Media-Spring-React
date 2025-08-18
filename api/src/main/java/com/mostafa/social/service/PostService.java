package com.mostafa.social.service;

import com.mostafa.social.dto.post.CreatePostDTO;
import com.mostafa.social.dto.post.PostResponseDTO;
import com.mostafa.social.dto.post.UpdatePostDTO;
import com.mostafa.social.global.CustomResponseException;
import com.mostafa.social.mapper.EntityDtoMapper;
import com.mostafa.social.model.Post;
import com.mostafa.social.model.PostLike;
import com.mostafa.social.model.User;
import com.mostafa.social.repository.PostLikeRepo;
import com.mostafa.social.repository.PostRepo;
import com.mostafa.social.repository.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepo postRepo;
    private final PostLikeRepo postLikeRepo;
    private final UserRepo userRepo;
    private final EntityDtoMapper mapper;
    private final NotificationService notificationService;


    //    Create
    public PostResponseDTO createPost(CreatePostDTO dto) {
        User user = userRepo.findById(dto.userId())
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("User not found with this ID: " + dto.userId()));

        Post post = mapper.toPostEntity(dto);
        post.setUser(user);

        Post savedPost = postRepo.save(post);

        // Get likes count
        Long likesCount = postLikeRepo.countLikesByPostId(savedPost.getId());
        // Check CurrentUser ((Liked or Not))
        boolean isLikedByCurrentUser = false;

        return mapper.toPostResponseDTO(savedPost, likesCount, isLikedByCurrentUser);
    }

    //    Update
    public PostResponseDTO updatePost(Integer postId, UpdatePostDTO dto, Integer currentUserId) {
        Post existingPost = postRepo.findById(postId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("Post not found with this ID: " + postId));

        // Only update fields that are provided (not null)
        if (dto.title() != null && !dto.title().trim().isEmpty()) {
            existingPost.setTitle(dto.title());
        }
        if (dto.description() != null) {
            existingPost.setDescription(dto.description());
        }
        if (dto.imageUrl() != null) {
            existingPost.setImageUrl(dto.imageUrl());
        }
        if (dto.imageUrl() != null) {
            existingPost.setImageUrl(dto.imageUrl());
        }

        Post updatedPost = postRepo.save(existingPost);


        // Get likes count
        Long likesCount = postLikeRepo.countLikesByPostId(updatedPost.getId());
        // Check CurrentUser ((Liked or Not))
        boolean isLikedByCurrentUser = currentUserId != null &&
                postLikeRepo.findByUserIdAndPostId(currentUserId, updatedPost.getId()).isPresent();

        return mapper.toPostResponseDTO(updatedPost, likesCount, isLikedByCurrentUser);
    }

    //    Delete
    public String deletePost(Integer postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("Post not found with this ID: " + postId));

        postRepo.delete(post);

        return "Post Deleted Success!!";
    }

    //    Get Single
    public PostResponseDTO getPost(Integer postId, Integer currentUserId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound("Post not found with this ID: " + postId));

        // Get likes count
        Long likesCount = postLikeRepo.countLikesByPostId(postId);
        // Check CurrentUser ((Liked or Not))
        boolean isLikedByCurrentUser = currentUserId != null &&
                postLikeRepo.findByUserIdAndPostId(currentUserId, postId).isPresent();


        return mapper.toPostResponseDTO(post, likesCount, isLikedByCurrentUser);
    }

    //    Get All
    public Page<PostResponseDTO> getAllPosts(int page, int size, Integer currentUserId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postsPage = postRepo.findAll(pageable);

        // Convert Page<Post> to Page<PostResponseDTO>
        return postsPage.map(post -> {
            // Get likes count
            Long likesCount = postLikeRepo.countLikesByPostId(post.getId());
            // Check CurrentUser ((Liked or Not))
            boolean isLikedByCurrentUser = currentUserId != null &&
                    postLikeRepo.findByUserIdAndPostId(currentUserId, post.getId()).isPresent();


            return mapper.toPostResponseDTO(post, likesCount, isLikedByCurrentUser);
        });
    }

    // Get All for ((Specific-User))
    public Page<PostResponseDTO> getAllPostsForUser(
            Integer userId, int page, int size, Integer currentUserId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postsPage = postRepo.findByUserId(userId, pageable);

        // Convert Page<Post> to Page<PostResponseDTO>
        return postsPage.map(post -> {
            // Get likes count
            Long likesCount = postLikeRepo.countLikesByPostId(post.getId());
            // Check CurrentUser ((Liked or Not))
            boolean isLikedByCurrentUser = currentUserId != null &&
                    postLikeRepo.findByUserIdAndPostId(currentUserId, post.getId()).isPresent();


            return mapper.toPostResponseDTO(post, likesCount, isLikedByCurrentUser);
        });
    }

    //    ************************ ((Specifications)) ******************************** //
    // like/disLike Post
    @Transactional
    public String toggleLike(Integer userId, Integer postId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound(
                        "User not found with this ID: " + userId));
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> CustomResponseException.ResourceNotFound(
                        "Post not found with this ID: " + postId));

        // Check if user already liked this post
        Optional<PostLike> existingLike = postLikeRepo.findByUserIdAndPostId(userId, postId);

        if (existingLike.isPresent()) {
            // disLike
            postLikeRepo.delete(existingLike.get());
            return "Post unliked successfully";
        } else {
            // Like
            PostLike newLike = PostLike.builder()
                    .user(user)
                    .post(post)
                    .build();

            postLikeRepo.save(newLike);
            notificationService.createPostLikeNotification(post, user);
            return "Post liked successfully";
        }
    }

}
