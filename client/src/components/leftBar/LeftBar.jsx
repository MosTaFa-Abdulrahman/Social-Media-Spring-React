import "./leftBar.scss";
import {
  CalendarRange,
  Clock,
  Gamepad2,
  Images,
  Mails,
  School,
  Soup,
  Store,
  Tv,
  Users,
} from "lucide-react";
import { useContext } from "react";

// Context
import { AuthContext } from "../../context/authContext";
import { NavLink } from "react-router-dom";

const defaultUserImg = "https://img.icons8.com/?size=80&id=21441&format=png";

function LeftBar() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <NavLink to={`/profile/${currentUser.id}`}>
              <img src={currentUser?.imgUrl || defaultUserImg} alt="" />
            </NavLink>
            <span>{currentUser?.fullName || ""}</span>
          </div>
          <div className="item">
            <Users />
            <span>Friends</span>
          </div>

          <div className="item">
            <Store />
            <span>Marketplace</span>
          </div>
          <div className="item">
            <Tv />
            <span>Watch</span>
          </div>
          <div className="item">
            <Clock />
            <span>Memories</span>
          </div>
        </div>
        <hr />
        <div className="menu">
          <span>Your shortcuts</span>
          <div className="item">
            <CalendarRange />
            <span>Events</span>
          </div>
          <div className="item">
            <Gamepad2 />
            <span>Gaming</span>
          </div>
          <div className="item">
            <Images />
            <span>Gallery</span>
          </div>

          <div className="item">
            <Mails />
            <span>Messages</span>
          </div>
        </div>
        <hr />
        <div className="menu">
          <span>Others</span>
          <div className="item">
            <School />
            <span>School</span>
          </div>
          <div className="item">
            <Soup />
            <span>Soups</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftBar;
