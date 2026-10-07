import {
  FiBell,
  FiChevronDown,
  FiUser,
} from "react-icons/fi";

function Header() {
  return (
    <header className="sf-header">

      <div className="sf-header-title">
        <span>The Universal School</span>
      </div>

      <div className="sf-header-actions">

        <button
          className="sf-icon-button"
          title="Notifications"
        >
          <FiBell />
          <span className="sf-notification-dot" />
        </button>

        <button className="sf-profile-button">

          <div className="sf-avatar">
            <FiUser />
          </div>

          <div className="sf-profile-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>

          <FiChevronDown />

        </button>

      </div>

    </header>
  );
}

export default Header;