import "./posts.scss";
import { useEffect } from "react";
import Post from "./post/Post";

// Loading && Error
import LoadingData from "../global/loading/LoadingData";
import ErrorData from "../global/error/ErrorData";

// React-Query
import { usePosts, usePostsForUser } from "../../store/posts";

// Get userId from ((Profile Page))
function Posts({ userId = null }) {
  // React-Query
  const allPostsQuery = usePosts();
  const userPostsQuery = usePostsForUser(userId);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = userId ? userPostsQuery : allPostsQuery;

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
        <LoadingData
          size="large"
          text={userId ? "Loading user posts..." : "Loading posts..."}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="posts">
        <ErrorData
          message={error?.response?.data?.message || "Failed to load posts"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const allPosts = data?.pages?.flatMap((page) => page.data.content) || [];

  return (
    <div className="posts">
      {allPosts.length === 0 ? (
        <div className="posts__empty">
          <p>
            {userId
              ? "No posts found for this user. They haven't shared anything yet!"
              : "No posts found. Be the first to share something!"}
          </p>
        </div>
      ) : (
        <>
          {allPosts?.map((post) => (
            <Post key={post.id} post={post} />
          ))}

          {/* Loading More */}
          {isFetchingNextPage && (
            <div className="posts__loading-more">
              <LoadingData size="small" text="Loading more posts..." />
            </div>
          )}

          {/* End of Posts */}
          {!hasNextPage && allPosts.length > 0 && (
            <div className="posts__end">
              <p>You've reached the end! 🎉😘</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Posts;
