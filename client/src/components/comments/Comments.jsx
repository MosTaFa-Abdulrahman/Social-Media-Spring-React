import "./comments.scss";
import {
  Heart,
  MessageCircle,
  Trash2,
  Send,
  MoreHorizontal,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import ErrorData from "../global/error/ErrorData";
import LoadingData from "../global/loading/LoadingData";
// Dummy-Data (userImg)
import { defaultUserImg } from "../../dummyData";

// Component
import Replies from "./replies/Replies";

// Context && React-Query
import { AuthContext } from "../../context/authContext";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useToggleLike,
} from "../../store/comments";
import {
  useCreateReply,
  useDeleteReply,
  useToggleLike as useToggleReplyLike,
} from "../../store/replies";

function Comments({ postId }) {
  // States
  const [newComment, setNewComment] = useState("");
  const [replyTexts, setReplyTexts] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [showDropdown, setShowDropdown] = useState({});

  // Context && React-Query
  const { currentUser } = useContext(AuthContext);
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useComments(postId);

  // Mutations
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const toggleCommentLikeMutation = useToggleLike();
  const createReplyMutation = useCreateReply();
  const deleteReplyMutation = useDeleteReply();
  const toggleReplyLikeMutation = useToggleReplyLike();

  // Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1000 >=
        document.documentElement.offsetHeight
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Loading + Error
  if (isLoading) {
    return (
      <div className="posts">
        <LoadingData size="large" text="Loading comments..." />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="posts">
        <ErrorData
          message={error?.response?.data?.message || "Failed to load comments"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const allComments = data?.pages?.flatMap((page) => page.data.content) || [];

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / 604800000);
    const months = Math.floor(diff / 2629746000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    return `${months}mo ago`;
  };

  // Handle new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        text: newComment,
        postId: postId,
        userId: currentUser.id,
      });
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  // Handle like toggle for comments
  const handleCommentLike = async (commentId) => {
    try {
      await toggleCommentLikeMutation.mutateAsync(commentId);
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  // Handle reply
  const handleReply = async (commentId) => {
    const replyText = replyTexts[commentId];
    if (!replyText?.trim()) return;

    try {
      await createReplyMutation.mutateAsync({
        text: replyText,
        commentId: commentId,
        userId: currentUser.id,
      });

      setReplyTexts({ ...replyTexts, [commentId]: "" });
      setShowReplyInput({ ...showReplyInput, [commentId]: false });
      setShowReplies({ ...showReplies, [commentId]: true });
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      setShowDropdown({});
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Handle delete reply
  const handleDeleteReply = async (replyId) => {
    try {
      await deleteReplyMutation.mutateAsync(replyId);
      setShowDropdown({});
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  // Handle reply like
  const handleReplyLike = async (replyId) => {
    try {
      await toggleReplyLikeMutation.mutateAsync(replyId);
    } catch (error) {
      console.error("Error toggling reply like:", error);
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (id, isReply = false) => {
    const key = isReply ? `reply_${id}` : `comment_${id}`;
    setShowDropdown({
      ...showDropdown,
      [key]: !showDropdown[key],
    });
  };

  // Handle reply input toggle
  const toggleReplyInput = (commentId) => {
    setShowReplyInput({
      ...showReplyInput,
      [commentId]: !showReplyInput[commentId],
    });
  };

  // Handle show/hide replies
  const toggleReplies = (commentId) => {
    setShowReplies({
      ...showReplies,
      [commentId]: !showReplies[commentId],
    });
  };

  return (
    <div className="comments">
      {/* Comments Header */}
      <div className="comments-header">
        <h3>Comments ({allComments.length})</h3>
      </div>

      {/* Write new comment */}
      <div className="write-comment">
        <div className="user-avatar">
          <img src={currentUser?.imgUrl || defaultUserImg} alt="Your avatar" />
        </div>
        <div className="comment-input-container">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            rows="1"
            disabled={createCommentMutation.isPending}
          />
          <button
            className={`send-btn ${newComment.trim() ? "active" : ""}`}
            onClick={handleAddComment}
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="comments-list">
        {allComments?.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-avatar">
              <img
                src={comment.userImg || defaultUserImg}
                alt={`${comment.username}'s avatar`}
              />
            </div>

            <div className="comment-content">
              {/* Comment Header */}
              <div className="comment-header">
                <div className="user-info">
                  <span className="username">{comment.username}</span>
                  <span className="timestamp">
                    {formatTimeAgo(comment.createdDate)}
                  </span>
                </div>

                {comment.userId === currentUser?.id && (
                  <div className="comment-menu">
                    <button
                      className="menu-trigger"
                      onClick={() => toggleDropdown(comment.id, false)}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {showDropdown[`comment_${comment.id}`] && (
                      <div className="dropdown-menu">
                        <button
                          className="menu-item delete-item"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Comment Text */}
              <div className="comment-text">
                <p>{comment.text}</p>
              </div>

              {/* Comment Actions */}
              <div className="comment-actions">
                <button
                  className={`action-btn like-btn ${
                    comment.isLikedByCurrentUser ? "liked" : ""
                  }`}
                  onClick={() => handleCommentLike(comment.id)}
                  disabled={toggleCommentLikeMutation.isPending}
                >
                  <Heart
                    size={16}
                    fill={
                      comment.isLikedByCurrentUser ? "currentColor" : "none"
                    }
                  />
                  <span>{comment.likesCount}</span>
                </button>

                <button
                  className="action-btn reply-btn"
                  onClick={() => toggleReplyInput(comment.id)}
                >
                  <MessageCircle size={16} />
                  Reply
                </button>

                {/* Show replies button */}
                <button
                  className="action-btn view-replies-btn"
                  onClick={() => toggleReplies(comment.id)}
                >
                  {showReplies[comment.id] ? "Hide" : "View"} replies
                </button>
              </div>

              {/* Reply Input */}
              {showReplyInput[comment.id] && (
                <div className="reply-input">
                  <div className="user-avatar">
                    <img
                      src={currentUser?.imgUrl || defaultUserImg}
                      alt="Your avatar"
                    />
                  </div>
                  <div className="reply-input-container">
                    <textarea
                      placeholder="Write a reply..."
                      value={replyTexts[comment.id] || ""}
                      onChange={(e) =>
                        setReplyTexts({
                          ...replyTexts,
                          [comment.id]: e.target.value,
                        })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleReply(comment.id);
                        }
                      }}
                      rows="1"
                      disabled={createReplyMutation.isPending}
                    />
                    <button
                      className={`send-btn ${
                        replyTexts[comment.id]?.trim() ? "active" : ""
                      }`}
                      onClick={() => handleReply(comment.id)}
                      disabled={
                        !replyTexts[comment.id]?.trim() ||
                        createReplyMutation.isPending
                      }
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Replies - Now using separate component */}
              <Replies
                comment={comment}
                currentUser={currentUser}
                showReplies={showReplies[comment.id]}
                onToggleReplyLike={handleReplyLike}
                onDeleteReply={handleDeleteReply}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Loading more comments */}
      {isFetchingNextPage && (
        <div className="loading-more">
          <LoadingData size="small" text="Loading more comments..." />
        </div>
      )}

      {/* Empty State */}
      {allComments.length === 0 && (
        <div className="empty-state">
          <MessageCircle size={48} />
          <h4>No comments yet</h4>
          <p>Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}

export default Comments;
