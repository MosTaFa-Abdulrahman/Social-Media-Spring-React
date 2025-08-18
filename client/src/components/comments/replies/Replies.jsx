import { Heart, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
// Dummy-Data (userImg)
import { defaultUserImg } from "../../../dummyData";

// Component
import LoadingData from "../../global/loading/LoadingData";

// React-Query
import { useReplies } from "../../../store/replies";

function Replies({
  comment,
  currentUser,
  showReplies,
  onToggleReplyLike,
  onDeleteReply,
}) {
  const {
    data: repliesData,
    isLoading: repliesLoading,
    fetchNextPage: fetchNextRepliesPage,
    hasNextPage: hasNextRepliesPage,
    isFetchingNextPage: isFetchingNextRepliesPage,
  } = useReplies(showReplies ? comment.id : null);

  const replies =
    repliesData?.pages?.flatMap((page) => page.data.content) || [];
  const [showDropdown, setShowDropdown] = useState({});

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

  const toggleDropdown = (replyId) => {
    const key = `reply_${replyId}`;
    setShowDropdown((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showReplies) return null;

  return (
    <div className="replies">
      {repliesLoading && replies?.length === 0 && (
        <div className="replies-loading">
          <LoadingData size="small" text="Loading replies..." />
        </div>
      )}

      {replies?.length > 0 &&
        replies?.map((reply) => (
          <div key={reply.id} className="reply">
            <div className="reply-avatar">
              <img
                src={reply.userImg || defaultUserImg}
                alt={`${reply.username}'s avatar`}
              />
            </div>

            <div className="reply-content">
              {/* Reply Header */}
              <div className="reply-header">
                <div className="user-info">
                  <span className="username">{reply.username}</span>
                  <span className="timestamp">
                    {formatTimeAgo(reply.createdDate)}
                  </span>
                </div>

                {reply.userId === currentUser?.id && (
                  <div className="reply-menu">
                    <button
                      className="menu-trigger"
                      onClick={() => toggleDropdown(reply.id)}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {showDropdown[`reply_${reply.id}`] && (
                      <div className="dropdown-menu">
                        <button
                          className="menu-item delete-item"
                          onClick={() => onDeleteReply(reply.id)}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reply Text */}
              <div className="reply-text">
                <p>{reply.text}</p>
              </div>

              {/* Reply Actions */}
              <div className="reply-actions">
                <button
                  className={`action-btn like-btn ${
                    reply.isLikedByCurrentUser ? "liked" : ""
                  }`}
                  onClick={() => onToggleReplyLike(reply.id)}
                >
                  <Heart
                    size={14}
                    fill={reply.isLikedByCurrentUser ? "currentColor" : "none"}
                  />
                  <span>{reply.likesCount}</span>
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Load More Replies Button */}
      {hasNextRepliesPage && (
        <button
          className="load-more-replies-btn action-btn"
          onClick={() => fetchNextRepliesPage()}
          disabled={isFetchingNextRepliesPage}
        >
          {isFetchingNextRepliesPage ? "Loading..." : "Load more replies"}
        </button>
      )}

      {/* No replies message */}
      {!repliesLoading && replies.length === 0 && (
        <div className="no-replies">
          <p>No replies yet. Be the first to reply!</p>
        </div>
      )}
    </div>
  );
}

export default Replies;
