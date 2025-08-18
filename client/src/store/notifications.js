import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { makeRequest } from "../requestMethod";

// Query Keys
export const NOTIFICATIONS_QUERY_KEY = ["notifications"];
export const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"];

// *********************************** ((EndPoints)) ****************************************

// Get All for Current User
const fetchNotifications = async ({ pageParam = 1 }) => {
  const response = await makeRequest.get(
    `/notifications?page=${pageParam}&size=10`
  );
  return response.data;
};

// Delete
const deleteNotification = async (notificationId) => {
  const response = await makeRequest.delete(`/notifications/${notificationId}`);
  return response.data;
};

// Get Count for unread
const fetchUnReadNotificationsCount = async () => {
  const response = await makeRequest.get(`/notifications/unread-count`);
  return response.data;
};

// Mark Read Single
const markReadSingle = async (notificationId) => {
  const response = await makeRequest.put(
    `/notifications/read/${notificationId}`
  );
  return response.data;
};

// Mark All Read
const markAllRead = async () => {
  const response = await makeRequest.put(`/notifications/read-all`);
  return response.data;
};

// *********************************** ((React-Query Hooks)) ****************************************

// Get All Notifications with Infinite Scroll
export const useNotifications = () => {
  return useInfiniteQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => {
      const { data } = lastPage;
      return data.hasNext ? data.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// Get Unread Count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnReadNotificationsCount,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
  });
};

// Delete Notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData(
        NOTIFICATIONS_QUERY_KEY
      );
      const previousUnreadCount = queryClient.getQueryData(
        UNREAD_COUNT_QUERY_KEY
      );

      // Optimistically update notifications list
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              content: page.data.content.filter(
                (notif) => notif.id !== notificationId
              ),
            },
          })),
        };
      });

      // Optimistically update unread count
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, (old) => {
        if (!old) return old;
        const wasUnread = previousNotifications?.pages
          ?.flatMap((page) => page.data.content)
          ?.find((notif) => notif.id === notificationId && !notif.isRead);

        return wasUnread ? { ...old, data: Math.max(0, old.data - 1) } : old;
      });

      return { previousNotifications, previousUnreadCount };
    },
    onError: (error, notificationId, context) => {
      // Revert optimistic updates
      queryClient.setQueryData(
        NOTIFICATIONS_QUERY_KEY,
        context.previousNotifications
      );
      queryClient.setQueryData(
        UNREAD_COUNT_QUERY_KEY,
        context.previousUnreadCount
      );
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
};

// Mark Single as Read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markReadSingle,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      const previousNotifications = queryClient.getQueryData(
        NOTIFICATIONS_QUERY_KEY
      );
      const previousUnreadCount = queryClient.getQueryData(
        UNREAD_COUNT_QUERY_KEY
      );

      // Optimistically mark as read
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              content: page.data.content.map((notif) =>
                notif.id === notificationId ? { ...notif, isRead: true } : notif
              ),
            },
          })),
        };
      });

      // Optimistically decrease unread count
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, (old) => {
        if (!old) return old;
        const wasUnread = !previousNotifications?.pages
          ?.flatMap((page) => page.data.content)
          ?.find((notif) => notif.id === notificationId)?.isRead;

        return wasUnread ? { ...old, data: Math.max(0, old.data - 1) } : old;
      });

      return { previousNotifications, previousUnreadCount };
    },
    onError: (error, notificationId, context) => {
      queryClient.setQueryData(
        NOTIFICATIONS_QUERY_KEY,
        context.previousNotifications
      );
      queryClient.setQueryData(
        UNREAD_COUNT_QUERY_KEY,
        context.previousUnreadCount
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
};

// Mark All as Read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      const previousNotifications = queryClient.getQueryData(
        NOTIFICATIONS_QUERY_KEY
      );
      const previousUnreadCount = queryClient.getQueryData(
        UNREAD_COUNT_QUERY_KEY
      );

      // Optimistically mark all as read
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              content: page.data.content.map((notif) => ({
                ...notif,
                isRead: true,
              })),
            },
          })),
        };
      });

      // Set unread count to 0
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, (old) =>
        old ? { ...old, data: 0 } : old
      );

      return { previousNotifications, previousUnreadCount };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        NOTIFICATIONS_QUERY_KEY,
        context.previousNotifications
      );
      queryClient.setQueryData(
        UNREAD_COUNT_QUERY_KEY,
        context.previousUnreadCount
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
};
