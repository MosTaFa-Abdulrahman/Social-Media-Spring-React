import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "../requestMethod";

// Query Keys
export const COMMENTS_QUERY_KEY = "comments";

// *********************************** ((EndPoints)) **************************************** //
// Get All
const fetchComments = async ({ pageParam = 1, postId }) => {
  const response = await makeRequest.get(
    `/comments/post/${postId}?page=${pageParam}&size=10`
  );
  return response.data;
};

// Create
const createComment = async (commentData) => {
  const response = await makeRequest.post("/comments", commentData);
  return response.data;
};

// Delete
const deleteComment = async (commentId) => {
  const response = await makeRequest.delete(`/comments/${commentId}`);
  return response.data;
};

// Like/disLike
const toggleLike = async (commentId) => {
  const response = await makeRequest.post(`/comments/${commentId}/like`);
  return response.data;
};

// *********************************** ((React-Query)) **************************************** //
// Get All
export const useComments = (postId) => {
  return useInfiniteQuery({
    queryKey: [COMMENTS_QUERY_KEY, postId],
    queryFn: ({ pageParam }) => fetchComments({ pageParam, postId }),

    getNextPageParam: (lastPage) => {
      const { data } = lastPage;
      return data.hasNext ? data.currentPage + 1 : undefined;
    },

    initialPageParam: 1,
    enabled: !!postId, // Only run query if postId exists
  });
};

// Create
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (data, variables) => {
      // Invalidate comments for the specific post
      queryClient.invalidateQueries({
        queryKey: [COMMENTS_QUERY_KEY, variables.postId],
      });
    },
    onError: (error) => {
      console.error("Failed to create comment:", error);
    },
  });
};

// Delete
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: (data, commentId) => {
      // Invalidate all comments queries since we don't know which post this comment belongs to
      queryClient.invalidateQueries({
        queryKey: [COMMENTS_QUERY_KEY],
      });
    },
    onError: (error) => {
      console.error("Failed to delete comment:", error);
    },
  });
};

// Like/disLike
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      // Invalidate all comments queries
      queryClient.invalidateQueries({
        queryKey: [COMMENTS_QUERY_KEY],
      });
    },
    onError: (error) => {
      console.error("Failed to toggle like:", error);
    },
  });
};

// Helper hook to get comments count for a specific post
export const useCommentsCount = (postId) => {
  const { data } = useComments(postId);

  const totalComments =
    data?.pages?.reduce((total, page) => {
      return total + (page?.data?.content?.length || 0);
    }, 0) || 0;

  return totalComments;
};
