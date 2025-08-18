import "./stories.scss";
import { useContext, useState } from "react";
import LoadingData from "../global/loading/LoadingData";
import ErrorData from "../global/error/ErrorData";
import upload from "../../upload";

// Default Image
import { defaultUserImg } from "../../dummyData";

// Context & React-Query
import { AuthContext } from "../../context/authContext";
import {
  useGetStories,
  useCreateStory,
  useDeleteStory,
} from "../../store/stories";
import toast from "react-hot-toast";

function Stories() {
  // Context & React-Query
  const { currentUser } = useContext(AuthContext);
  const {
    data: storiesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStories();
  const createStoryMutation = useCreateStory();
  const deleteStoryMutation = useDeleteStory();

  const allStories = storiesResponse?.data || [];

  // States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [storyText, setStoryText] = useState("");
  const [storyFile, setStoryFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is image or video
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error("Please select an image or video file.");
        return;
      }

      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size should be less than 50MB.");
        return;
      }

      setStoryFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add Story
  const handleAddStory = async () => {
    if (!filePreview || !currentUser?.id) {
      toast.error("Please select a file and make sure you're logged in.");
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Cloudinary
      const mediaUrl = await upload(storyFile);

      if (!mediaUrl) {
        toast.error("Failed to upload file. Please try again.");
        return;
      }

      // Create story object
      const storyData = {
        mediaUrl: mediaUrl,
        userId: currentUser.id,
        text: storyText || "",
      };

      // Call API to create story
      await createStoryMutation.mutateAsync(storyData);

      // Reset form and close modal
      handleCloseCreateModal();

      // Show success message
      toast.success("Story created successfully!");
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to create story. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Delete Story
  const handleDeleteStory = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) {
      return;
    }

    try {
      await deleteStoryMutation.mutateAsync(storyId);
      toast.success("Story deleted successfully!");
      setShowViewModal(false);
      setSelectedStory(null);
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story. Please try again.");
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setStoryText("");
    setStoryFile(null);
    setFilePreview("");
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedStory(null);
  };

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setShowViewModal(true);
  };

  const isFileVideo = (url) => {
    return (
      url &&
      (url.includes("/video/") ||
        url.includes(".mp4") ||
        url.includes(".webm") ||
        url.includes(".ogg") ||
        url.includes("video"))
    );
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now - storyDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Loading + Error
  if (isLoading) {
    return (
      <div className="posts">
        <LoadingData size="large" text="Loading stories..." />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="posts">
        <ErrorData
          message={error?.response?.data?.message || "Failed to load stories"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <>
      <div className="stories-wrapper">
        <div className="stories-container">
          {/* Current User Story - Add New */}
          <div
            className="story user-story"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="story-image">
              <img
                src={currentUser?.imgUrl || defaultUserImg}
                alt="Your story"
              />
              <div className="add-story-overlay">
                <div className="add-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="story-info">
              <span className="story-username">Add Story</span>
            </div>
          </div>

          {/* Other Stories */}
          {allStories?.map((story) => (
            <div
              className="story"
              key={story.id}
              onClick={() => handleStoryClick(story)}
            >
              <div className="story-image">
                {isFileVideo(story.mediaUrl) ? (
                  <video
                    src={story.mediaUrl}
                    alt={story.username}
                    muted
                    loop
                    preload="metadata"
                  />
                ) : (
                  <img src={story.mediaUrl} alt={story.username} />
                )}
                <div className="story-gradient"></div>
              </div>
              <div className="story-info">
                <span className="story-username">
                  {story.userFullName || story.username}
                </span>
                <span className="story-time">
                  {story.createdAt && formatTimeAgo(story.createdAt)}
                </span>
              </div>
              {story.userId === currentUser?.id && (
                <div className="story-actions">
                  <button
                    className="delete-story-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStory(story.id);
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseCreateModal}>
          <div
            className="modal-content create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Create Your Story</h3>
              <button className="close-button" onClick={handleCloseCreateModal}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* File Upload */}
              <div className="image-upload-section">
                <div className="image-preview-container">
                  {filePreview ? (
                    <div className="file-preview">
                      {storyFile && storyFile.type.startsWith("video/") ? (
                        <video
                          src={filePreview}
                          controls
                          className="video-preview"
                        />
                      ) : (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="image-preview"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <div className="upload-icon">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <p>Add a photo or video</p>
                      <small>Supports: JPG, PNG, MP4, WebM (Max: 50MB)</small>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="file-input"
                  id="story-file"
                  disabled={isUploading}
                />
                <label htmlFor="story-file" className="file-input-label">
                  {isUploading ? "Uploading..." : "Choose File"}
                </label>
              </div>

              {/* Text Input */}
              {/* <div className="text-input-section">
                <textarea
                  placeholder="Add a caption (optional)..."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  className="story-text-input"
                  rows="3"
                  disabled={isUploading}
                />
              </div> */}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={handleCloseCreateModal}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                className="share-button"
                onClick={handleAddStory}
                disabled={
                  !filePreview || isUploading || createStoryMutation.isLoading
                }
              >
                {isUploading || createStoryMutation.isLoading
                  ? "Sharing..."
                  : "Share Story"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Story Modal */}
      {showViewModal && selectedStory && (
        <div
          className="modal-overlay story-view-overlay"
          onClick={handleCloseViewModal}
        >
          <div
            className="story-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="story-view-header">
              <div className="story-user-info">
                <img
                  src={selectedStory?.userImg || defaultUserImg}
                  alt={selectedStory.username}
                  className="user-avatar"
                />
                <div className="user-details">
                  <span className="username">
                    {selectedStory.userFullName || selectedStory.username}
                  </span>
                  <span className="story-timestamp">
                    {selectedStory.createdAt &&
                      formatTimeAgo(selectedStory.createdAt)}
                  </span>
                </div>
              </div>
              <div className="story-actions">
                {selectedStory.userId === currentUser?.id && (
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteStory(selectedStory.id)}
                    disabled={deleteStoryMutation.isLoading}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                )}
                <button className="close-button" onClick={handleCloseViewModal}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="story-media-container">
              {isFileVideo(selectedStory.mediaUrl) ? (
                <video
                  src={selectedStory.mediaUrl}
                  controls
                  autoPlay
                  className="story-media"
                />
              ) : (
                <img
                  src={selectedStory.mediaUrl}
                  alt="Story content"
                  className="story-media"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Stories;
