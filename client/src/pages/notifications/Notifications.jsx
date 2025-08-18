import "./notifications.scss";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Check,
  CheckCheck,
  Loader,
  X,
  RefreshCw,
} from "lucide-react";
import { useState, useContext } from "react";
import moment from "moment";

// Default Images
import { defaultUserImg } from "../../dummyData";

// React-Quert & Context
import { AuthContext } from "../../context/authContext";
import {
  useNotifications,
  useDeleteNotification,
  useMarkAsRead,
  useMarkAllAsRead,
  useUnreadCount,
} from "../../store/notifications";
import toast from "react-hot-toast";

const NotificationIcon = ({ type }) => {
  switch (type) {
    case "POST_LIKE":
    case "COMMENT_LIKE":
    case "REPLY_LIKE":
      return <Heart className="notification-icon like-icon" size={18} />;
    case "POST_COMMENT":
    case "COMMENT_REPLY":
      return (
        <MessageCircle className="notification-icon comment-icon" size={18} />
      );
    case "USER_FOLLOW":
      return <UserPlus className="notification-icon follow-icon" size={18} />;
    default:
      return <Bell className="notification-icon default-icon" size={18} />;
  }
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const { currentUser } = useContext(AuthContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Handle Delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(notification.id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Mark Single
  const handleMarkAsRead = async () => {
    if (notification.isRead) return;

    setIsMarkingRead(true);
    try {
      await onMarkAsRead(notification.id);
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    } finally {
      setIsMarkingRead(false);
    }
  };

  const isRead = notification.isRead;

  return (
    <div className={`notification-item ${!isRead ? "unread" : ""}`}>
      <div className="notification-content" onClick={handleMarkAsRead}>
        <div className="notification-icon-wrapper">
          <NotificationIcon type={notification.type} />
          {!isRead && <div className="unread-indicator"></div>}
        </div>

        <div className="notification-details">
          <div className="notification-header">
            <img
              src={notification?.userImgUrl || defaultUserImg}
              alt={notification?.userFullName || "User"}
              className="sender-avatar"
              onError={(e) => {
                e.target.src = defaultUserImg;
              }}
            />
            <span className="sender-name">
              {notification?.userFullName || "Someone"}
            </span>
          </div>

          <p className="notification-message">
            {notification.message ||
              notification.type?.message ||
              "You have a new notification"}
          </p>

          <span className="notification-time">
            {moment(notification.createdDate).fromNow()}
          </span>
        </div>
      </div>

      <div className="notification-actions">
        {!isRead && (
          <button
            onClick={handleMarkAsRead}
            disabled={isMarkingRead}
            className="mark-read-btn"
            title="Mark as read"
          >
            {isMarkingRead ? (
              <Loader className="spinning" size={14} />
            ) : (
              <Check size={14} />
            )}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="delete-btn"
          title="Delete notification"
        >
          {isDeleting ? (
            <Loader className="spinning" size={14} />
          ) : (
            <X size={14} />
          )}
        </button>
      </div>
    </div>
  );
};

function Notifications() {
  const {
    data: notificationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNotifications();

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
    isFetching: isFetchingCount,
  } = useUnreadCount();

  const deleteNotificationMutation = useDeleteNotification();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Transformation
  const allNotifications =
    notificationsData?.pages?.flatMap((page) => page.data.content) || [];

  // Handle unread count from your backend response structure
  const unreadCount = unreadCountData?.data || 0;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchUnreadCount()]);
    toast.success("Notifications refreshed");
  };

  // Handle Read All
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
      console.error("Mark all as read error:", error);
    }
  };

  // Handle Read Single
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Mark as read error:", error);
      throw error;
    }
  };

  // Handle Delete
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      console.log(notificationId);
    } catch (error) {
      console.error("Delete notification error:", error);
      throw error;
    }
  };

  // Loading & Error
  if (isLoading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h2>Notifications</h2>
        </div>
        <div className="notifications-loading">
          <Loader className="spinning" size={24} />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h2>Notifications</h2>
        </div>
        <div className="notifications-error">
          <p>Failed to load notifications: {error?.message}</p>
          <button onClick={handleRefresh} className="retry-btn">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // console.log(allNotifications);

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-left">
          <h2>
            <Bell size={24} />
            Notifications
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </h2>

          <div className="refresh-container">
            <button
              onClick={handleRefresh}
              disabled={isFetching || isFetchingCount}
              className="refresh-btn"
              title="Refresh notifications"
            >
              <RefreshCw
                className={isFetching || isFetchingCount ? "spinning" : ""}
                size={16}
              />
              Refresh
            </button>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="mark-all-read-btn"
          >
            {markAllAsReadMutation.isPending ? (
              <Loader className="spinning" size={16} />
            ) : (
              <CheckCheck size={16} />
            )}
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {allNotifications?.length === 0 ? (
          <div className="no-notifications">
            <Bell size={48} />
            <h3>No notifications yet</h3>
            <p>When you get notifications, they'll show up here.</p>
            <button onClick={handleRefresh} className="refresh-btn">
              <RefreshCw size={16} />
              Check for new notifications
            </button>
          </div>
        ) : (
          <>
            {allNotifications?.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}

            {hasNextPage && (
              <div className="load-more-container">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="load-more-btn"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader className="spinning" size={16} />
                      Loading more...
                    </>
                  ) : (
                    "Load more notifications"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Notifications;
