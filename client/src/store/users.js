import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "../requestMethod";

// Query Keys
export const USERS_QUERY_KEY = ["users"];

// *********************************** ((API Functions)) **************************************** //
// Get Single User
const fetchUser = async (userId) => {
  const response = await makeRequest.get(`/users/${userId}`);
  return response.data;
};

// Update User
const updateUser = async ({ userId, ...userData }) => {
  const response = await makeRequest.put(`/users/${userId}`, userData);
  return response.data;
};

// Get Suggested Users
const fetchSuggestedUsers = async ({ pageParam = 1 }) => {
  const response = await makeRequest.get(
    `/users/suggested?page=${pageParam}&size=10`
  );
  return response.data;
};

// Follow User
const followUser = async ({ followingId }) => {
  const response = await makeRequest.post(`/users/follow/${followingId}`);
  return response.data;
};

// Unfollow User
const unfollowUser = async ({ followingId }) => {
  const response = await makeRequest.delete(`/users/unfollow/${followingId}`);
  return response.data;
};

// Get Followers Count
const fetchFollowersCount = async (userId) => {
  const response = await makeRequest.get(`/users/${userId}/followers/count`);
  return response.data;
};

// Get Followings Count
const fetchFollowingsCount = async (userId) => {
  const response = await makeRequest.get(`/users/${userId}/followings/count`);
  return response.data;
};

// Get Followers (Paginated)
const fetchFollowers = async ({ pageParam = 1, userId }) => {
  const response = await makeRequest.get(
    `/users/${userId}/followers?page=${pageParam}&size=10`
  );
  return response.data;
};

// Get Followings (Paginated)
const fetchFollowings = async ({ pageParam = 1, userId }) => {
  const response = await makeRequest.get(
    `/users/${userId}/followings?page=${pageParam}&size=10`
  );
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //
// Get Single User
export const useUser = (userId) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
};

// Update User
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Get Suggested Users with Infinite Scroll
export const useSuggestedUsers = () => {
  return useInfiniteQuery({
    queryKey: ["suggestedUsers"],
    queryFn: ({ pageParam = 1 }) => fetchSuggestedUsers({ pageParam }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages, hasNext } = lastPage.data;
      return hasNext && currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

// Follow User
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["followersCount"] });
      queryClient.invalidateQueries({ queryKey: ["followingsCount"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["followings"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Unfollow User
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["followersCount"] });
      queryClient.invalidateQueries({ queryKey: ["followingsCount"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["followings"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Get Followers Count
export const useFollowersCount = (userId) => {
  return useQuery({
    queryKey: ["followersCount", userId],
    queryFn: () => fetchFollowersCount(userId),
    enabled: !!userId,
  });
};

// Get Followings Count
export const useFollowingsCount = (userId) => {
  return useQuery({
    queryKey: ["followingsCount", userId],
    queryFn: () => fetchFollowingsCount(userId),
    enabled: !!userId,
  });
};

// Get Followers with Infinite Scroll
export const useFollowers = (userId, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["followers", userId],
    queryFn: ({ pageParam = 1 }) => fetchFollowers({ pageParam, userId }),
    enabled: !!userId && enabled,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages, hasNext } = lastPage.data;
      return hasNext && currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

// Get Followings with Infinite Scroll
export const useFollowings = (userId, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["followings", userId],
    queryFn: ({ pageParam = 1 }) => fetchFollowings({ pageParam, userId }),
    enabled: !!userId && enabled,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages, hasNext } = lastPage.data;
      return hasNext && currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};
