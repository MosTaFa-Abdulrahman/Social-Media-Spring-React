import "./navbar.scss";
import {
  Bell,
  Grid2x2Plus,
  House,
  Mail,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  User2,
} from "lucide-react";
import { useContext, useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

// Default Image
import { defaultUserImg } from "../../dummyData";

// Context &  React-Query
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { useUnreadCount } from "../../store/notifications";

function Navbar() {
  const { currentUser, logout } = useContext(AuthContext);
  const { toggle, darkMode } = useContext(DarkModeContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // React-Query
  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = unreadCountData?.data || 0;

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/auth/login");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "purple" }}>Spring-Social</span>
        </Link>
        <House />
        {darkMode ? <Sun onClick={toggle} /> : <Moon onClick={toggle} />}
        <Grid2x2Plus />
      </div>

      <div className="right">
        <Mail />
        <NavLink to={"/notifications"} className="notification-bell">
          <Bell />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>

        <div className="user" ref={dropdownRef}>
          <div
            className="user-info"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src={currentUser?.imgUrl || defaultUserImg} alt="" />
            <span>{currentUser?.fullName || ""}</span>
            <ChevronDown
              className={`dropdown-arrow ${showDropdown ? "rotated" : ""}`}
            />
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <NavLink
                to={`/profile/${currentUser.id}`}
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <User2 size={16} />
                <span>Profile</span>
              </NavLink>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
