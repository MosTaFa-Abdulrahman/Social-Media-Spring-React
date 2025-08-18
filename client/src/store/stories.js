import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../requestMethod";

// Query Keys
export const STORIES_QUERY_KEY = "stories";

// *********************************** ((EndPoints)) **************************************** //
// Get All
const fetchStories = async () => {
  const response = await makeRequest.get(`/stories`);
  return response.data;
};

// Get Single
const fetchSingleStory = async (storyId) => {
  const response = await makeRequest.get(`/stories/${storyId}`);
  return response.data;
};

// Create
const createStory = async (storyData) => {
  const response = await makeRequest.post("/stories", storyData);
  return response.data;
};

// Delete
const deleteStory = async (storyId) => {
  const response = await makeRequest.delete(`/stories/${storyId}`);
  return response.data;
};

// *********************************** ((React-Query)) **************************************** //
// Get All
export const useGetStories = () => {
  return useQuery({
    queryKey: [STORIES_QUERY_KEY],
    queryFn: fetchStories,
    onError: (error) => {
      console.error("Failed to fetch stories:", error);
    },
  });
};

// Get Single
export const useGetSingleStory = () => {
  return useQuery({
    queryKey: [STORIES_QUERY_KEY],
    queryFn: fetchSingleStory,
    onError: (error) => {
      console.error("Failed to fetch story:", error);
    },
  });
};

// Create
export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStory,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [STORIES_QUERY_KEY, variables.storyId],
      });
    },
    onError: (error) => {
      console.error("Failed to create story:", error);
    },
  });
};

// Delete
export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStory,
    onSuccess: (data, storyId) => {
      queryClient.invalidateQueries({
        queryKey: [STORIES_QUERY_KEY],
      });
    },
    onError: (error) => {
      console.error("Failed to delete story:", error);
    },
  });
};
