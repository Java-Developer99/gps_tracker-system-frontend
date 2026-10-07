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
  FiSmartphone
} from "react-icons/fi";
import { useState } from "react";

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fleetOpen, setFleetOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const closeMobile = () => {
    setMobileOpen(false);
  };

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
        <div
          className="sf-sidebar-overlay"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`sf-sidebar ${mobileOpen ? "sf-sidebar-open" : ""
          }`}
      >
        <div className="sf-brand">
          <div className="sf-brand-logo">
            <img src="/applogo.png"
              alt="SF" />
          </div>

          <div className="sf-brand-text">
            <strong>SyncFleet</strong>
            <span>Track. Manage. Move</span>
          </div>

          <button
            className="sf-sidebar-close"
            onClick={closeMobile}
          >
            <FiX />
          </button>
        </div>

        <nav className="sf-sidebar-nav">

          <div className="sf-nav-section">
            <div className="sf-nav-title">
              OVERVIEW
            </div>

            <NavLink
              to="/dashboard"
              onClick={closeMobile}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""
                }`
              }
            >
              <FiGrid />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/live"
              onClick={closeMobile}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""
                }`
              }
            >
              <FiMap />
              <span>Live</span>
            </NavLink>

            <NavLink
              to="/playback"
              onClick={closeMobile}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""
                }`
              }
            >
              <FiPlay />
              <span>Playback</span>
            </NavLink>
          </div>

          <div className="sf-nav-section">

            <button
              className="sf-nav-section-toggle"
              onClick={() =>
                setFleetOpen(!fleetOpen)
              }
            >
              <span>FLEET</span>
              <FiChevronDown
                className={
                  fleetOpen ? "" : "collapsed"
                }
              />
            </button>

            {fleetOpen && (
              <>

                <NavLink
                  to="/dealers"
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <FiBriefcase />
                  <span>Dealers</span>
                </NavLink>

                <NavLink to="/subDealers"
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""}`
                  }>
                  <FiGitBranch />
                  <span>SubDealers</span>
                </NavLink>

                <NavLink to="/companies"
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""}`
                  }>
                  <FiHome />
                  <span>Companies</span>
                </NavLink>

                <NavLink to="/branches"
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""}`
                  }>
                  <FiMapPin />
                  <span>Branches</span>
                </NavLink>

                <NavLink
                  to="/vehicles"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""
                    }`
                  }
                >
                  <FiTruck />
                  <span>Vehicles</span>
                </NavLink>
                
                <NavLink
                  to="/sims"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""
                    }`
                  }
                >
                  <FiSmartphone />
                  <span>Sims</span>
                </NavLink>


              </>
            )}
          </div>

          <div className="sf-nav-section">
            <div className="sf-nav-title">
              REPORTS
            </div>

            <NavLink
              to="/reports"
              onClick={closeMobile}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""
                }`
              }
            >
              <FiFileText />
              <span>Reports</span>
            </NavLink>

            <NavLink
              to="/alerts"
              onClick={closeMobile}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""
                }`
              }
            >
              <FiBell />
              <span>Alerts</span>
            </NavLink>
          </div>

          <div className="sf-nav-section">

            <button
              className="sf-nav-section-toggle"
              onClick={() =>
                setAdminOpen(!adminOpen)
              }
            >
              <span>ADMIN</span>
              <FiChevronDown
                className={
                  adminOpen ? "" : "collapsed"
                }
              />
            </button>

            {adminOpen && (
              <>
                <NavLink
                  to="/users"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""
                    }`
                  }
                >
                  <FiUsers />
                  <span>Users</span>
                </NavLink>

                <NavLink
                  to="/settings"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `sf-nav-link ${isActive ? "active" : ""
                    }`
                  }
                >
                  <FiSettings />
                  <span>Settings</span>
                </NavLink>
              </>
            )}
          </div>

          <div className="sf-nav-section">

            <div className="sf-nav-title">
              SUPPORT
            </div>

            <NavLink
              to="/about"
              onClick={closeMobile}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""
                }`
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