import "./post.scss";
import {
  Heart,
  Loader2,
  MessageCircleDashed,
  Share,
  Trash,
} from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
// Dummy-Data (userImg)
import { defaultUserImg } from "../../../dummyData";

// Components
import Comments from "../../comments/Comments";

// Context && React-Query
import { AuthContext } from "../../../context/authContext";
import { useDeletePost, useToggleLike } from "../../../store/posts";
import { useCommentsCount } from "../../../store/comments";
import toast from "react-hot-toast";

function Post({ post }) {
  // States
  const [commentOpen, setCommentOpen] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(false);

  // Context && React-Query
  const { currentUser } = useContext(AuthContext);
  const toggleLikeMutation = useToggleLike();
  const deletePost = useDeletePost();
  const totalComments = useCommentsCount(post.id);

  // Handle Like Changed
  useEffect(() => {
    // Use the isLikedByCurrentUser field from the API response
    setIsLiked(post.isLikedByCurrentUser || false);
  }, [post.isLikedByCurrentUser]);

  // ********************************* ((Actions-Buttons)) ************************************* //
  // Handle like
  const handleLikeToggle = async () => {
    if (!currentUser) {
      toast.error("Please login to like posts");
      return;
    }

    // Prevent multiple clicks
    if (toggleLikeMutation.isPending) return;

    const previousIsLiked = isLiked;
    const previousLikesCount = localLikesCount;

    try {
      // Optimistic update
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked
        ? localLikesCount + 1
        : localLikesCount - 1;

      setIsLiked(newIsLiked);
      setLocalLikesCount(newLikesCount);

      await toggleLikeMutation.mutateAsync(post.id);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(previousIsLiked);
      setLocalLikesCount(previousLikesCount);

      toast.error("Failed to toggle like");
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post.id);
      toast.success("Post Deleted Success 🥰");
    } catch (error) {
      toast.error("Failed to Delete Post 😥");
    }
  };

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post?.userImg || defaultUserImg} alt="userImg" />
            <div className="details">
              <Link
                to={`/profile/${post?.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">
                  {post?.userFullName || post?.username}
                </span>
              </Link>
              <span className="date">
                {moment(post?.createdDate).format("MMMM Do YYYY [at] h:mm A")}
              </span>
            </div>
          </div>
          {currentUser?.id === post?.userId && (
            <Trash
              size={18}
              style={{ color: "tomato", cursor: "pointer" }}
              onClick={handleDelete}
            />
          )}
        </div>
        <div className="content">
          <p>{post.description}</p>
          {post?.imageUrl && <img src={post?.imageUrl || ""} alt="postImg" />}
        </div>

        <div className="info">
          <div
            className={`item like-item ${isLiked ? "liked" : ""}`}
            onClick={handleLikeToggle}
          >
            {toggleLikeMutation.isPending ? (
              <Loader2 className="like-loader" size={16} />
            ) : (
              <Heart
                className={`heart-icon ${isLiked ? "heart-filled" : ""}`}
                fill={isLiked ? "currentColor" : "none"}
                size={16}
              />
            )}
            <span className="like-count">{localLikesCount} Likes</span>
          </div>

          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <MessageCircleDashed />
            {totalComments} Comments
          </div>
          <div className="item">
            <Share />
            Share
          </div>
        </div>

        {commentOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
}

export default Post;
