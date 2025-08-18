import "./profileModal.scss";
import {
  X,
  Users,
  MapPin,
  Save,
  UserPlus,
  UserMinus,
  Camera,
  Image,
} from "lucide-react";
import { useState, useContext } from "react";
import upload from "../../../upload";
// Default
import { defaultUserImg } from "../../../dummyData";

// Context & React-Query
import { AuthContext } from "../../../context/authContext";
import {
  useFollowers,
  useFollowings,
  useUpdateUser,
  useFollowUser,
  useUnfollowUser,
} from "../../../store/users";
import toast from "react-hot-toast";

function ProfileModal({ type, userId, user, onClose }) {
  // currentUser
  const { currentUser } = useContext(AuthContext);

  // States
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || "",
    imgUrl: user?.imgUrl || "",
    coverImgUrl: user?.coverImgUrl || "",
    city: user?.city || "",
  });
  const [uploading, setUploading] = useState({
    profile: false,
    cover: false,
  });

  // React-Query
  const {
    data: followersInfo,
    fetchNextPage: fetchNextFollowers,
    hasNextPage: hasNextFollowers,
    isFetchingNextPage: isFetchingFollowers,
  } = useFollowers(userId, type === "followers");
  const {
    data: followingsInfo,
    fetchNextPage: fetchNextFollowings,
    hasNextPage: hasNextFollowings,
    isFetchingNextPage: isFetchingFollowings,
  } = useFollowings(userId, type === "followings");

  // Mutations
  const updateUserMutation = useUpdateUser();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [type]: true }));
      const uploadedUrl = await upload(file);

      if (uploadedUrl) {
        const fieldName = type === "profile" ? "imgUrl" : "coverImgUrl";
        setEditForm((prev) => ({
          ...prev,
          [fieldName]: uploadedUrl,
        }));
        toast.success(
          `${
            type === "profile" ? "Profile" : "Cover"
          } image uploaded successfully!`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();

    // Basic validation
    if (!editForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    updateUserMutation.mutate(
      { userId, ...editForm },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
          onClose();
        },
        onError: (error) => {
          console.error("Update error:", error);
          toast.error("Failed to update profile");
        },
      }
    );
  };

  const handleFollowAction = (targetUserId, isFollowing) => {
    if (isFollowing) {
      unfollowMutation.mutate(
        { followingId: targetUserId },
        {
          onSuccess: () => toast.success("Unfollowed successfully"),
          onError: () => toast.error("Failed to unfollow"),
        }
      );
    } else {
      followMutation.mutate(
        { followingId: targetUserId },
        {
          onSuccess: () => toast.success("Followed successfully"),
          onError: () => toast.error("Failed to follow"),
        }
      );
    }
  };

  const renderUsersList = (data, fetchNextPage, hasNextPage, isFetching) => {
    // Fixed: Handle the correct data structure from your database response
    // The data comes as { pages: [{ data: { content: [...users], hasNext: boolean } }] }
    const users =
      data?.pages?.flatMap((page) => page.data?.content || []) || [];

    // Check if there's more data to load based on the database response
    const hasMore =
      data?.pages?.some((page) => page.data?.hasNext) || hasNextPage;

    return (
      <div className="users-list">
        {users?.length === 0 ? (
          <div className="no-users">
            <Users size={48} />
            <p>No users found</p>
          </div>
        ) : (
          <>
            {users?.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <img
                    src={user?.imgUrl || defaultUserImg}
                    alt={user?.fullName}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <h4 className="user-name">{user?.fullName}</h4>
                    <p className="user-username">@{user?.username}</p>
                  </div>
                </div>

                {currentUser?.id !== user?.id && (
                  <button
                    className={`follow-btn ${
                      user.isFollowing ? "following" : ""
                    }`}
                    onClick={() =>
                      handleFollowAction(user.id, user.isFollowing)
                    }
                    disabled={
                      followMutation.isPending || unfollowMutation.isPending
                    }
                  >
                    {user.isFollowing ? (
                      <>
                        <UserMinus size={14} />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}

            {hasMore && (
              <button
                className="load-more-btn"
                onClick={fetchNextPage}
                disabled={isFetching}
              >
                {isFetching ? "Loading..." : "Load More"}
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  const renderEditForm = () => (
    <form onSubmit={handleUpdateProfile} className="edit-form">
      {/* Profile Picture Upload */}
      <div className="image-upload-section">
        <div className="upload-group">
          <label className="upload-label">Profile Picture</label>
          <div className="image-preview-container">
            <img
              src={editForm.imgUrl || "/default-avatar.jpg"}
              alt="Profile Preview"
              className="profile-preview"
            />
            <div className="upload-overlay">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "profile")}
                id="profile-upload"
                className="file-input"
                disabled={uploading.profile}
              />
              <label htmlFor="profile-upload" className="upload-btn">
                {uploading.profile ? (
                  <div className="spinner"></div>
                ) : (
                  <Camera size={20} />
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Cover Picture Upload */}
        <div className="upload-group">
          <label className="upload-label">Cover Picture</label>
          <div className="cover-preview-container">
            <img
              src={editForm.coverImgUrl || "/default-cover.jpg"}
              alt="Cover Preview"
              className="cover-preview"
            />
            <div className="upload-overlay">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "cover")}
                id="cover-upload"
                className="file-input"
                disabled={uploading.cover}
              />
              <label htmlFor="cover-upload" className="upload-btn">
                {uploading.cover ? (
                  <div className="spinner"></div>
                ) : (
                  <Image size={20} />
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="fullName"
          value={editForm.fullName}
          onChange={handleInputChange}
          placeholder="Your full name"
          required
        />
      </div>

      <div className="form-group">
        <label>
          <MapPin size={16} />
          City
        </label>
        <input
          type="text"
          name="city"
          value={editForm.city}
          onChange={handleInputChange}
          placeholder="Your city"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="save-btn"
          disabled={
            updateUserMutation.isPending || uploading.profile || uploading.cover
          }
        >
          <Save size={16} />
          {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );

  const getModalTitle = () => {
    switch (type) {
      case "followers":
        return "Followers";
      case "followings":
        return "Following";
      case "edit":
        return "Edit Profile";
      default:
        return "";
    }
  };

  const getModalContent = () => {
    switch (type) {
      case "followers":
        return renderUsersList(
          followersInfo,
          fetchNextFollowers,
          hasNextFollowers,
          isFetchingFollowers
        );
      case "followings":
        return renderUsersList(
          followingsInfo,
          fetchNextFollowings,
          hasNextFollowings,
          isFetchingFollowings
        );
      case "edit":
        return renderEditForm();
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getModalTitle()}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">{getModalContent()}</div>
      </div>
    </div>
  );
}

export default ProfileModal;
