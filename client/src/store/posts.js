import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "../requestMethod";

// Query Keys
export const POSTS_QUERY_KEY = ["posts"];

// *********************************** ((EndPoints)) **************************************** //
// Get All
const fetchPosts = async ({ pageParam = 1 }) => {
  const response = await makeRequest.get(`/posts?page=${pageParam}&size=10`);
  return response.data;
};

// Get All For ((Specific-User))
const fetchPostsForUser = async ({ pageParam = 1, userId }) => {
  const response = await makeRequest.get(
    `/posts/user/${userId}?page=${pageParam}&size=10`
  );
  return response.data;
};

// Get Single
const fetchPost = async (postId) => {
  const response = await makeRequest.get(`/posts/${postId}`);
  return response.data;
};

// Create
const createPost = async (postData) => {
  const response = await makeRequest.post("/posts", postData);
  return response.data;
};

// Update
const updatePost = async ({ postId, ...postData }) => {
  const response = await makeRequest.put(`/posts/${postId}`, postData);
  return response.data;
};

// Delete
const deletePost = async (postId) => {
  const response = await makeRequest.delete(`/posts/${postId}`);
  return response.data;
};

// Like/disLike
const toggleLike = async (postId) => {
  const response = await makeRequest.post(`/posts/${postId}/like`);
  return response.data;
};

// *********************************** ((React-Query)) **************************************** //
// Get All
export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: fetchPosts,

    getNextPageParam: (lastPage) => {
      const { data } = lastPage;
      return data.hasNext ? data.currentPage + 1 : undefined;
    },

    initialPageParam: 1,
  });
};

// Get All for ((Specific-User))
export const usePostsForUser = (userId) => {
  return useInfiniteQuery({
    queryKey: [POSTS_QUERY_KEY, userId],
    queryFn: ({ pageParam }) => fetchPostsForUser({ pageParam, userId }),

    getNextPageParam: (lastPage) => {
      const { data } = lastPage;
      return data.hasNext ? data.currentPage + 1 : undefined;
    },

    initialPageParam: 1,
    enabled: !!userId, // Only run query if userId exists
  });
};

// Get Single
export const usePost = (postId) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
  });
};

// Create
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });
};

// Update
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};

// Delete
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};

// Like/disLike
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};
