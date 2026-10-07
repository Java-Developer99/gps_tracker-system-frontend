import {
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiMap,
  FiPlay,
  FiFileText,
  FiTruck,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import "../../css/Dashboard.css"

function StatCard({
  title,
  value,
  icon: Icon,
  type,
}) {
  return (
    <div className="sf-stat-card">

      <div className={`sf-stat-icon ${type}`}>
        <Icon />
      </div>

      <div className="sf-stat-content">

        <span>{title}</span>

        <strong>{value}</strong>

      </div>

    </div>
  );
}

function Dashboard() {

  const navigate = useNavigate();

  const stats = {
    vehicles: 24,
    active: 18,
    idle: 4,
    offline: 2,
  };

  const vehicles = [
    {
      regNo: "MH 14 AB 1234",
      type: "Bus",
      status: "Active",
    },
    {
      regNo: "MH 04 CD 5678",
      type: "Van",
      status: "Idle",
    },
    {
      regNo: "MH 01 EF 9012",
      type: "Bus",
      status: "Active",
    },
    {
      regNo: "MH 12 GH 3456",
      type: "Car",
      status: "Offline",
    },
  ];

  const alerts = [
    {
      type: "danger",
      title: "Overspeed",
      vehicle: "MH 14 AB 1234",
      time: "2 minutes ago",
    },
    {
      type: "warning",
      title: "Vehicle Idle",
      vehicle: "MH 04 CD 5678",
      time: "10 minutes ago",
    },
    {
      type: "success",
      title: "Trip Completed",
      vehicle: "MH 01 EF 9012",
      time: "25 minutes ago",
    },
  ];

  return (
    <div className="sf-dashboard">

      {/* PAGE HEADER */}

      <div className="sf-dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Monitor your fleet activity and vehicle
            status from one place.
          </p>
        </div>

        <div className="sf-dashboard-actions">

          <button
            className="sf-outline-button"
            onClick={() => navigate("/live")}
          >
            <FiActivity />
            Live
          </button>

          <button
            className="sf-primary-button"
            onClick={() => navigate("/playback")}
          >
            <FiPlay />
            Playback
          </button>

        </div>

      </div>


      {/* STAT CARDS */}

      <section className="sf-stats-grid">

        <StatCard
          title="Vehicles"
          value={stats.vehicles}
          icon={FiTruck}
          type="blue"
        />

        <StatCard
          title="Active"
          value={stats.active}
          icon={FiActivity}
          type="green"
        />

        <StatCard
          title="Idle"
          value={stats.idle}
          icon={FiClock}
          type="orange"
        />

        <StatCard
          title="Offline"
          value={stats.offline}
          icon={FiAlertTriangle}
          type="red"
        />

      </section>


      {/* MAP + VEHICLES */}

      <section className="sf-dashboard-grid">

        <div className="sf-dashboard-card sf-map-card">

          <div className="sf-card-header">

            <div>
              <h2>Fleet Map</h2>
              <span>
                Current vehicle overview
              </span>
            </div>

            <button
              className="sf-card-action"
              onClick={() => navigate("/live")}
            >
              View Live Map
            </button>

          </div>

          <div className="sf-map-placeholder">

            <div className="sf-map-grid">

              <div className="sf-map-road sf-road-one" />
              <div className="sf-map-road sf-road-two" />
              <div className="sf-map-road sf-road-three" />

              <div className="sf-dashboard-vehicle v1">
                🚌
              </div>

              <div className="sf-dashboard-vehicle v2">
                🚐
              </div>

              <div className="sf-dashboard-vehicle v3">
                🚍
              </div>

            </div>

            <button
              className="sf-map-overlay-button"
              onClick={() => navigate("/live")}
            >
              <FiMap />
              Open Live Map
            </button>

          </div>

        </div>


        <div className="sf-dashboard-card">

          <div className="sf-card-header">

            <div>
              <h2>Vehicle Status</h2>
              <span>
                Latest fleet activity
              </span>
            </div>

            <button
              className="sf-card-action"
              onClick={() => navigate("/vehicles")}
            >
              View All
            </button>

          </div>

          <div className="sf-vehicle-list">

            {vehicles.map((vehicle) => (

              <div
                className="sf-vehicle-row"
                key={vehicle.regNo}
              >

                <div className="sf-vehicle-icon">
                  <FiTruck />
                </div>

                <div className="sf-vehicle-info">

                  <strong>
                    {vehicle.regNo}
                  </strong>

                  <span>
                    {vehicle.type}
                  </span>

                </div>

                <span
                  className={`sf-status sf-status-${vehicle.status.toLowerCase()}`}
                >
                  <i />
                  {vehicle.status}
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* BOTTOM */}

      <section className="sf-dashboard-grid">

        <div className="sf-dashboard-card">

          <div className="sf-card-header">

            <div>
              <h2>Recent Alerts</h2>
              <span>
                Latest fleet notifications
              </span>
            </div>

            <button
              className="sf-card-action"
              onClick={() => navigate("/alerts")}
            >
              View All
            </button>

          </div>

          <div className="sf-alert-list">

            {alerts.map((alert, index) => (

              <div
                className="sf-alert-row"
                key={index}
              >

                <div
                  className={`sf-alert-icon ${alert.type}`}
                >
                  {alert.type === "danger" && (
                    <FiAlertTriangle />
                  )}

                  {alert.type === "warning" && (
                    <FiClock />
                  )}

                  {alert.type === "success" && (
                    <FiActivity />
                  )}
                </div>

                <div className="sf-alert-info">

                  <strong>
                    {alert.title}
                  </strong>

                  <span>
                    {alert.vehicle}
                  </span>

                </div>

                <time>
                  {alert.time}
                </time>

              </div>

            ))}

          </div>

        </div>


        <div className="sf-dashboard-card">

          <div className="sf-card-header">

            <div>
              <h2>Quick Actions</h2>
              <span>
                Frequently used tools
              </span>
            </div>

          </div>

          <div className="sf-quick-actions">

            <button
              onClick={() => navigate("/live")}
            >
              <FiMap />

              <span>
                <strong>Live Tracking</strong>
                <small>
                  Monitor vehicles in real time
                </small>
              </span>
            </button>

            <button
              onClick={() => navigate("/playback")}
            >
              <FiPlay />

              <span>
                <strong>Playback</strong>
                <small>
                  Review historical journeys
                </small>
              </span>
            </button>

            <button
              onClick={() => navigate("/report")}
            >
              <FiFileText />

              <span>
                <strong>Reports</strong>
                <small>
                  Generate fleet reports
                </small>
              </span>
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;