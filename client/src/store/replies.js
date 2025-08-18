import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "../requestMethod";

// Query Keys
export const REPLIES_QUERY_KEY = ["replies"];

// *********************************** ((EndPoints)) **************************************** //
// Get All
const fetchReplies = async ({ pageParam = 1, commentId }) => {
  const response = await makeRequest.get(
    `/replies/comment/${commentId}?page=${pageParam}&size=10`
  );
  return response.data;
};

// Create
const createReply = async (replyData) => {
  const response = await makeRequest.post("/replies", replyData);
  return response.data;
};

// Delete
const deleteReply = async (replyId) => {
  const response = await makeRequest.delete(`/replies/${replyId}`);
  return response.data;
};

// Like/disLike
const toggleLike = async (replyId) => {
  const response = await makeRequest.post(`/replies/${replyId}/like`);
  return response.data;
};

// *********************************** ((React-Query)) **************************************** //
// Get All
export const useReplies = (commentId) => {
  return useInfiniteQuery({
    queryKey: [REPLIES_QUERY_KEY, commentId],
    queryFn: ({ pageParam }) => fetchReplies({ pageParam, commentId }),

    getNextPageParam: (lastPage) => {
      const { data } = lastPage;
      return data.hasNext ? data.currentPage + 1 : undefined;
    },

    initialPageParam: 1,
    enabled: !!commentId, // Only run query if commentId exists
  });
};

// Create
export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReply,
    onSuccess: (data, variables) => {
      // Invalidate REPLIES for the specific reply
      queryClient.invalidateQueries({
        queryKey: [REPLIES_QUERY_KEY, variables.commentId],
      });
    },
    onError: (error) => {
      console.error("Failed to create reply:", error);
    },
  });
};

// Delete
export const useDeleteReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReply,
    onSuccess: (data, replyId) => {
      // Invalidate all replies queries since we don't know which comment this reply belongs to
      queryClient.invalidateQueries({
        queryKey: [REPLIES_QUERY_KEY],
      });
    },
    onError: (error) => {
      console.error("Failed to delete reply:", error);
    },
  });
};

// Like/disLike
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      // Invalidate all replies queries
      queryClient.invalidateQueries({
        queryKey: [REPLIES_QUERY_KEY],
      });
    },
    onError: (error) => {
      console.error("Failed to toggle like:", error);
    },
  });
};
