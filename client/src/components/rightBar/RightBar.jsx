import "./rightBar.scss";
import { Users, UserPlus, UserMinus, Loader2, RefreshCw } from "lucide-react";
import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { defaultUserImg } from "../../dummyData";

// Context & React-Query
import { AuthContext } from "../../context/authContext";
import {
  useSuggestedUsers,
  useFollowUser,
  useUnfollowUser,
} from "../../store/users";
import toast from "react-hot-toast";

function RightBar() {
  // Context
  const { currentUser } = useContext(AuthContext);

  // States
  const [isVisible, setIsVisible] = useState(true);
  const [followedUsers, setFollowedUsers] = useState(new Set()); // Track followed users locally

  // Refs for infinite scroll
  const scrollContainerRef = useRef(null);

  // React-Query Hooks
  const {
    data: suggestedUsersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useSuggestedUsers();

  // Mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Get all users from pages
  const allSuggestedUsers =
    suggestedUsersData?.pages?.flatMap((page) => page.data?.content || []) ||
    [];

  // Filter out current user and already followed users
  const filteredUsers = allSuggestedUsers.filter(
    (user) => user.id !== currentUser?.id && !followedUsers.has(user.id)
  );

  // Handle follow/unfollow actions
  const handleFollowAction = (targetUserId, isFollowing) => {
    if (isFollowing) {
      unfollowMutation.mutate(
        { followingId: targetUserId },
        {
          onSuccess: () => {
            toast.success("User unfollowed successfully");
            // Remove from followed users set
            setFollowedUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(targetUserId);
              return newSet;
            });
          },
          onError: (error) => {
            console.error("Unfollow error:", error);
            toast.error("Failed to unfollow user");
          },
        }
      );
    } else {
      followMutation.mutate(
        { followingId: targetUserId },
        {
          onSuccess: () => {
            toast.success("User followed successfully");
            // Add to followed users set to remove from suggestions
            setFollowedUsers((prev) => new Set(prev).add(targetUserId));
          },
          onError: (error) => {
            console.error("Follow error:", error);
            toast.error("Failed to follow user");
          },
        }
      );
    }
  };

  // Handle load more with infinite scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 5;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle load more button click
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    // Clear followed users set on refresh to show fresh suggestions
    setFollowedUsers(new Set());
  };

  // Auto-hide when no users and setup scroll listener
  useEffect(() => {
    if (!isLoading && filteredUsers.length === 0) {
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    } else if (filteredUsers.length > 0) {
      setIsVisible(true);
    }
  }, [isLoading, filteredUsers.length]);

  // Setup scroll listener for infinite scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Don't render if not visible
  if (!isVisible && filteredUsers.length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rightBar">
        <div className="container">
          <div className="item">
            <span>Suggestions For You</span>
            <div
              className="loading-container"
              style={{ textAlign: "center", padding: "20px" }}
            >
              <Loader2
                className="spinner"
                size={24}
                style={{ animation: "spin 1s linear infinite" }}
              />
              <p style={{ marginTop: "10px", color: "#666" }}>
                Finding awesome people...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rightBar">
        <div className="container">
          <div className="item">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <span>Suggestions For You</span>
              <button
                onClick={handleRefresh}
                disabled={isRefetching}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: isRefetching
                      ? "spin 1s linear infinite"
                      : "none",
                  }}
                />
              </button>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Users
                size={48}
                style={{ color: "#ccc", marginBottom: "10px" }}
              />
              <p style={{ color: "#666", marginBottom: "15px" }}>
                Failed to load suggestions
              </p>
              <button
                onClick={handleRefresh}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#5271ff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredUsers.length === 0) {
    return (
      <div className="rightBar">
        <div className="container">
          <div className="item">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <span>Suggestions For You</span>
              <button
                onClick={handleRefresh}
                disabled={isRefetching}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: isRefetching
                      ? "spin 1s linear infinite"
                      : "none",
                  }}
                />
              </button>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Users
                size={48}
                style={{ color: "#ccc", marginBottom: "10px" }}
              />
              <p style={{ color: "#666", marginBottom: "5px" }}>
                No new suggestions right now
              </p>
              <span style={{ color: "#999", fontSize: "14px" }}>
                Check back later for more people to follow
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <span>Suggestions For You</span>
            <button
              onClick={handleRefresh}
              disabled={isRefetching}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "5px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: isRefetching ? "spin 1s linear infinite" : "none",
                }}
              />
            </button>
          </div>

          {/* Scrollable container for users */}
          <div
            ref={scrollContainerRef}
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "5px",
              scrollbarWidth: "thin",
              scrollbarColor: "#888 transparent",
            }}
          >
            {/* Render all suggested users (no slice limit) */}
            {filteredUsers.map((user) => (
              <div key={user.id} className="user">
                <div className="userInfo">
                  <img
                    src={user?.imgUrl || defaultUserImg}
                    alt={user?.fullName || user?.username || "User"}
                    onError={(e) => {
                      e.target.src = defaultUserImg;
                    }}
                  />
                  <span>
                    {user?.fullName || user?.username || "Unknown User"}
                  </span>
                </div>
                <div className="buttons">
                  <button
                    onClick={() =>
                      handleFollowAction(user.id, user.isFollowing)
                    }
                    disabled={
                      followMutation.isPending || unfollowMutation.isPending
                    }
                    className={`follow-btn ${
                      user.isFollowing ? "following" : ""
                    }`}
                  >
                    {followMutation.isPending || unfollowMutation.isPending ? (
                      <Loader2
                        size={14}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : user.isFollowing ? (
                      <UserMinus size={14} />
                    ) : (
                      <UserPlus size={14} />
                    )}
                    {user.isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </div>
              </div>
            ))}

            {/* Loading indicator when fetching more */}
            {isFetchingNextPage && (
              <div style={{ textAlign: "center", padding: "15px" }}>
                <Loader2
                  size={20}
                  style={{
                    animation: "spin 1s linear infinite",
                    color: "#5271ff",
                  }}
                />
                <p
                  style={{ marginTop: "8px", color: "#666", fontSize: "14px" }}
                >
                  Loading more suggestions...
                </p>
              </div>
            )}

            {/* End of results indicator */}
            {!hasNextPage && filteredUsers.length > 0 && (
              <div style={{ textAlign: "center", padding: "15px" }}>
                <p style={{ color: "#999", fontSize: "14px" }}>
                  No more suggestions available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightBar;
