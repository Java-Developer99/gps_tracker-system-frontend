import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiMap,
  FiPlay,
  FiTruck,
  FiFileText,
  FiBell,
  FiUsers,
  FiSettings,
  FiInfo,
  FiMenu,
  FiX,
  FiChevronDown,
  FiBriefcase,
  FiGitBranch,
  FiHome,
  FiMapPin,
  FiSmartphone,
} from "react-icons/fi";
import { useState } from "react";
import { usePermission } from "../../context/PermissionContext";

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fleetOpen, setFleetOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const { hasPermission, loading } = usePermission();

  const closeMobile = () => {
    setMobileOpen(false);
  };

  // Fleet menu visibility
  const showFleet =
    !loading &&
    (hasPermission("Dealer") ||
      hasPermission("SubDealer") ||
      hasPermission("Company") ||
      hasPermission("Branch") ||
      hasPermission("Vehicle") ||
      hasPermission("SIM"));

  // Reports menu visibility
  const showReports =
    !loading && (hasPermission("Report") || hasPermission("Alert"));

  return (
    <>
      <button
        className="sf-mobile-menu-button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <FiMenu />
      </button>

      {mobileOpen && (
        <div className="sf-sidebar-overlay" onClick={closeMobile} />
      )}

      <aside className={`sf-sidebar ${mobileOpen ? "sf-sidebar-open" : ""}`}>
        <div className="sf-brand">
          <div className="sf-brand-logo">
            <img src="/applogo.png" alt="SF" />
          </div>

          <div className="sf-brand-text">
            <strong>SyncFleet</strong>
            <span>Track. Manage. Move</span>
          </div>

          <button className="sf-sidebar-close" onClick={closeMobile}>
            <FiX />
          </button>
        </div>

        <nav className="sf-sidebar-nav">
          {/* OVERVIEW */}
          <div className="sf-nav-section">
            <div className="sf-nav-title">OVERVIEW</div>

            <NavLink
              to="/dashboard"
              onClick={closeMobile}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""}`
              }
            >
              <FiGrid />
              <span>Dashboard</span>
            </NavLink>

            {!loading && hasPermission("Live") && (
              <NavLink
                to="/live"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `sf-nav-link ${isActive ? "active" : ""}`
                }
              >
                <FiMap />
                <span>Live</span>
              </NavLink>
            )}

            {!loading && hasPermission("Playback") && (
              <NavLink
                to="/playback"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `sf-nav-link ${isActive ? "active" : ""}`
                }
              >
                <FiPlay />
                <span>Playback</span>
              </NavLink>
            )}
          </div>

          {/* FLEET */}
          {showFleet && (
            <div className="sf-nav-section">
              <button
                className="sf-nav-section-toggle"
                onClick={() => setFleetOpen(!fleetOpen)}
              >
                <span>FLEET</span>
                <FiChevronDown className={fleetOpen ? "" : "collapsed"} />
              </button>

              {fleetOpen && (
                <>
                  {hasPermission("Dealer") && (
                    <NavLink
                      to="/dealers"
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `sf-nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      <FiBriefcase />
                      <span>Dealers</span>
                    </NavLink>
                  )}

                  {hasPermission("SubDealer") && (
                    <NavLink
                      to="/subDealers"
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `sf-nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      <FiGitBranch />
                      <span>SubDealers</span>
                    </NavLink>
                  )}

                  {hasPermission("Company") && (
                    <NavLink
                      to="/companies"
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `sf-nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      <FiHome />
                      <span>Companies</span>
                    </NavLink>
                  )}

                  {hasPermission("Branch") && (
                    <NavLink
                      to="/branches"
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `sf-nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      <FiMapPin />
                      <span>Branches</span>
                    </NavLink>
                  )}

                  {hasPermission("Vehicle") && (
                    <NavLink
                      to="/vehicles"
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `sf-nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      <FiTruck />
                      <span>Vehicles</span>
                    </NavLink>
                  )}

                  {hasPermission("SIM") && (
                    <NavLink
                      to="/sims"
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `sf-nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      <FiSmartphone />
                      <span>Sims</span>
                    </NavLink>
                  )}
                </>
              )}
            </div>
          )}

          {/* REPORTS */}
          {showReports && (
            <div className="sf-nav-section">
              <div className="sf-nav-title">REPORTS</div>

              {hasPermission("Report") && (
                <NavLink
                  to="/report"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <FiFileText />
                  <span>Reports</span>
                </NavLink>
              )}

              {hasPermission("Alert") && (
                <NavLink
                  to="/alerts"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <FiBell />
                  <span>Alerts</span>
                </NavLink>
              )}
            </div>
          )}

          {/* ADMIN */}
          <div className="sf-nav-section">
            <button
              className="sf-nav-section-toggle"
              onClick={() => setAdminOpen(!adminOpen)}
            >
              <span>ADMIN</span>
              <FiChevronDown className={adminOpen ? "" : "collapsed"} />
            </button>

            {adminOpen && (
              <>
                {!loading && hasPermission("User") && (
                  <NavLink
                    to="/users"
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `sf-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <FiUsers />
                    <span>Users</span>
                  </NavLink>
                )}

                {/* Settings remains visible until a matching
                    backend permission function is configured. */}
                <NavLink
                  to="/settings"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <FiSettings />
                  <span>Settings</span>
                </NavLink>
              </>
            )}
          </div>

          {/* SUPPORT */}
          <div className="sf-nav-section">
            <div className="sf-nav-title">SUPPORT</div>

            <NavLink
              to="/about"
              onClick={closeMobile}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""}`
              }
            >
              <FiInfo />
              <span>About</span>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
