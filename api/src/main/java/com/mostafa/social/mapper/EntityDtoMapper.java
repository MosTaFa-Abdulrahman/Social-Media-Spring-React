package com.mostafa.social.mapper;

import com.mostafa.social.dto.comment.CommentResponseDTO;
import com.mostafa.social.dto.comment.CreateCommentDTO;
import com.mostafa.social.dto.notification.NotificationDTO;
import com.mostafa.social.dto.post.CreatePostDTO;
import com.mostafa.social.dto.post.PostResponseDTO;
import com.mostafa.social.dto.reply.CreateReplyDTO;
import com.mostafa.social.dto.reply.ReplyResponseDTO;
import com.mostafa.social.dto.story.StoryResponseDTO;
import com.mostafa.social.dto.user.UserResponseDTO;
import com.mostafa.social.model.*;
import org.springframework.stereotype.Component;


@Component
public class EntityDtoMapper {

    //    ****************************** ((User)) ************************* //
    public UserResponseDTO toUserResponseDTO(User user, Boolean isFollowing) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getImgUrl(),
                user.getCoverImgUrl(),
                user.getCity(),
                isFollowing
        );
    }


    //    ****************************** ((Post)) ************************* //
    public Post toPostEntity(CreatePostDTO dto) {
        return Post.builder()
                .title(dto.title())
                .description(dto.description())
                .imageUrl(dto.imageUrl())
                .build();
    }

    public PostResponseDTO toPostResponseDTO(Post post, Long likesCount, Boolean isLikedByCurrentUser) {
        return new PostResponseDTO(
                post.getId(),
                post.getTitle(),
                post.getDescription(),
                post.getImageUrl(),
                post.getCreatedDate(),
                post.getLastModifiedDate(),
                likesCount,
                post.getUser().getId(),
                post.getUser().getUsername(),
                post.getUser().getImgUrl(),
                post.getUser().getFullName(),
                isLikedByCurrentUser
        );
    }

    //    ****************************** ((Comment)) ************************* //
    public Comment toCommentEntity(CreateCommentDTO dto) {
        return Comment.builder()
                .text(dto.text())
                .build();
    }

    public CommentResponseDTO toCommentResponseDTO(
            Comment comment,
            Long commentLikesCount,
            Boolean isLikedByCurrentUser) {
        return new CommentResponseDTO(
                comment.getId(),
                comment.getText(),
                comment.getCreatedDate(),
                comment.getLastModifiedDate(),
                commentLikesCount,
                comment.getUser().getId(),
                comment.getUser().getUsername(),
                comment.getUser().getImgUrl(),
                isLikedByCurrentUser,
                comment.getPost().getId(),
                comment.getPost().getTitle()
        );
    }


    //    ****************************** ((Reply)) ************************* //
    public Reply toReplyEntity(CreateReplyDTO dto) {
        return Reply.builder()
                .text(dto.text())
                .build();
    }

    public ReplyResponseDTO toReplyResponseDTO(Reply reply, Long likesCount, Boolean isLikedByCurrentUser) {
        return new ReplyResponseDTO(
                reply.getId(),
                reply.getText(),
                reply.getCreatedDate(),
                reply.getLastModifiedDate(),
                likesCount,
                reply.getUser().getId(),
                reply.getUser().getUsername(),
                reply.getUser().getImgUrl(),
                isLikedByCurrentUser,
                reply.getComment().getId()
        );
    }


    //    ****************************** ((Stories)) ************************* //
    public StoryResponseDTO toStoryResponseDTO(Story story) {
        User user = story.getUser();
        return new StoryResponseDTO(
                story.getId(),
                story.getMediaUrl(),
                story.getExpiredAt(),
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getImgUrl()
        );
    }

    //    ****************************** ((Notifications)) ************************* //
    public NotificationDTO toNotificationDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getIsRead(),
                notification.getType(),
                notification.getCreatedDate(),
                notification.getReferenceId(),
                notification.getTriggeredByUser().getId(),
                notification.getTriggeredByUser().getUsername(),
                notification.getTriggeredByUser().getEmail(),
                notification.getTriggeredByUser().getImgUrl(),
                notification.getTriggeredByUser().getFullName()
        );
    }


}

