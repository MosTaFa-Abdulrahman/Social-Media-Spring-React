import "./profile.scss";
import { Camera, MapPin, Edit3, Users, UserPlus } from "lucide-react";
import { useState, useContext } from "react";
import { useParams } from "react-router-dom";

// Default
import { defaultUserImg, defaultCoverImg } from "../../dummyData";

// Modal
import ProfileModal from "./profileModal/ProfileModal";

// Context & React-Query
import { AuthContext } from "../../context/authContext";
import {
  useUser,
  useFollowersCount,
  useFollowingsCount,
  useFollowUser,
  useUnfollowUser,
} from "../../store/users";
import toast from "react-hot-toast";
import Posts from "../../components/posts/Posts";

function Profile() {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React-Query
  const { data: userData, isLoading: userLoading } = useUser(id);
  const { data: followerData } = useFollowersCount(id);
  const { data: followingData } = useFollowingsCount(id);

  // Transformation
  const user = userData?.data;
  const followersCount = followerData?.data;
  const followingsCount = followingData?.data;

  // Mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollow = () => {
    if (user?.isFollowing) {
      unfollowMutation.mutate(
        { followingId: id },
        {
          onSuccess: () => toast.success("Unfollowed successfully"),
          onError: () => toast.error("Failed to unfollow"),
        }
      );
    } else {
      followMutation.mutate(
        { followingId: id },
        {
          onSuccess: () => toast.success("Followed successfully"),
          onError: () => toast.error("Failed to follow"),
        }
      );
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  if (userLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <h2>User not found</h2>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === parseInt(id);

  return (
    <div className="profile">
      {/* Cover Section */}
      <div className="profile-cover">
        <img
          src={user?.coverImgUrl || defaultCoverImg}
          alt="Cover"
          className="cover-image"
        />
        <div className="profile-avatar">
          <img
            src={user?.imgUrl || defaultUserImg}
            alt="Profile"
            className="avatar-image"
          />
          {isOwnProfile && (
            <button className="change-photo-btn">
              <Camera size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        <div className="profile-header">
          <div className="user-details">
            <h1 className="user-name">{user?.fullName || ""}</h1>
            <p className="username">@{user?.email || ""}</p>

            {/* {user?.bio && <p className="user-bio">{user.bio}</p>} */}

            <div className="user-meta">
              {user?.city && (
                <div className="meta-item">
                  <MapPin size={14} />
                  <span>{user.city}</span>
                </div>
              )}

              {/* <div className="meta-item">
                <Calendar size={14} />
                <span>Joined {moment(user.createdAt).format("MMMM YYYY")}</span>
              </div> */}
            </div>
          </div>

          <div className="profile-actions">
            {isOwnProfile ? (
              <button
                className="edit-profile-btn"
                onClick={() => openModal("edit")}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <button
                className={`follow-btn ${user.isFollowing ? "following" : ""}`}
                onClick={handleFollow}
                disabled={
                  followMutation.isPending || unfollowMutation.isPending
                }
              >
                <UserPlus size={16} />
                {followMutation.isPending || unfollowMutation.isPending
                  ? "Loading..."
                  : user.isFollowing
                  ? "Unfollow"
                  : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <button className="stat-item" onClick={() => openModal("followers")}>
            <span className="stat-number">{followersCount || 0}</span>
            <span className="stat-label">Followers</span>
          </button>

          <button className="stat-item" onClick={() => openModal("followings")}>
            <span className="stat-number">{followingsCount || 0}</span>
            <span className="stat-label">Following</span>
          </button>

          {/* <div className="stat-item">
            <span className="stat-number">{user.postsCount || 0}</span>
            <span className="stat-label">Posts</span>
          </div> */}
        </div>
      </div>

      {/* Posts Section */}
      <div className="profile-posts">
        <div className="posts-header">
          <h2>Posts</h2>
        </div>
        <Posts userId={id} />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ProfileModal
          type={modalType}
          userId={id}
          user={user}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Profile;
