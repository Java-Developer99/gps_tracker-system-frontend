import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";

function Header() {
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const role = localStorage.getItem("role") || "User";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    setIsProfileOpen(false);

    navigate("/login", { replace: true });
  };

  return (
    <header className="sf-header">
      <div className="sf-header-title">
        <span>{localStorage.getItem("name") || "SyncFleet"}</span>
      </div>

      <div className="sf-header-actions">
        <button className="sf-icon-button" title="Notifications" type="button">
          <FiBell />
          <span className="sf-notification-dot" />
        </button>

        <div className="sf-profile-container" ref={profileRef}>
          <button
            className="sf-profile-button"
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="sf-avatar">
              <FiUser />
            </div>

            <div className="sf-profile-info">
              <strong>{localStorage.getItem("name") || "User"}</strong>
              <span>{localStorage.getItem("email") || role}</span>
            </div>

            <FiChevronDown
              className={`sf-profile-chevron ${
                isProfileOpen ? "sf-rotate" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="sf-profile-dropdown">
              <div className="sf-dropdown-user">
                <div className="sf-avatar sf-dropdown-avatar">
                  <FiUser />
                </div>

                <div>
                  <strong>{role}</strong>
                  <span>Signed in to SyncFleet</span>
                </div>
              </div>

              <div className="sf-dropdown-divider" />

              <button
                type="button"
                className="sf-dropdown-logout"
                onClick={handleLogout}
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
