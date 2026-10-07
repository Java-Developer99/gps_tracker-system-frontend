import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../services/api";
import PlaybackMap from "../map/PlaybackMap";
import "../../css/Playback.css";

const MAX_RANGE_MS = 24 * 60 * 60 * 1000;
const SPEEDS = [1, 2, 5, 10, 20, 50];

function formatPlaybackTime(date) {
  if (!date) return "--";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "0m";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function Playback() {
  const [devices, setDevices] = useState([]);
  const [imei, setImei] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [points, setPoints] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(10);

  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingPlayback, setLoadingPlayback] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDevices() {
      setLoadingDevices(true);

      try {
        const response = await api.get("/api/device");
        if (mounted) setDevices(response.data || []);
      } catch (err) {
        if (mounted) {
          setError(
            "Could not load devices. You can still enter an IMEI manually."
          );
        }
      } finally {
        if (mounted) setLoadingDevices(false);
      }
    }

    loadDevices();

    return () => {
      mounted = false;
    };
  }, []);

  const maxEndDate = useMemo(
    () => (fromDate ? new Date(fromDate.getTime() + MAX_RANGE_MS) : null),
    [fromDate]
  );

  const handleFromChange = (date) => {
    setError("");
    setInfo("");
    setFromDate(date);

    if (!date) {
      setToDate(null);
      return;
    }

    const maximum = new Date(date.getTime() + MAX_RANGE_MS);

    if (toDate && toDate > maximum) {
      setToDate(null);
      setInfo("The previous end time was outside the new 24-hour window.");
    }
  };

  const handleToChange = (date) => {
    setError("");
    setInfo("");

    if (!date || !fromDate) {
      setToDate(date);
      return;
    }

    const maximum = new Date(fromDate.getTime() + MAX_RANGE_MS);

    if (date < fromDate) {
      setToDate(fromDate);
      setError("End time cannot be earlier than start time.");
      return;
    }

    if (date > maximum) {
      // Hard UI guard. The backend also rejects >24 hours.
      setToDate(maximum);
      setError("Playback is limited to a maximum of 24 hours.");
      return;
    }

    setToDate(date);
  };

  const fetchPlayback = async () => {
    setError("");
    setInfo("");

    if (!imei.trim()) {
      setError("Select a device or enter its IMEI.");
      return;
    }

    if (!fromDate || !toDate) {
      setError("Please select both From and To date/time.");
      return;
    }

    const range = toDate.getTime() - fromDate.getTime();

    if (range <= 0) {
      setError("To date/time must be after From date/time.");
      return;
    }

    if (range > MAX_RANGE_MS) {
      setError("Playback range cannot exceed 24 hours.");
      return;
    }

    setLoadingPlayback(true);
    setIsPlaying(false);
    setPoints([]);
    setCurrentIndex(0);

    try {
      const response = await api.get("/api/playback", {
        params: {
          imei: imei.trim(),
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
      });

      const receivedPoints = response.data?.points || [];

      setPoints(receivedPoints);
      setCurrentIndex(0);

      if (!receivedPoints.length) {
        setInfo("No GPS coordinates were found for this device and time range.");
      } else if (response.data?.truncated) {
        setInfo(
          "The result contains the maximum 20,000 points. The route is still plotted in chronological order."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to fetch playback data from the server."
      );
    } finally {
      setLoadingPlayback(false);
    }
  };

  const restart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const togglePlayback = () => {
    if (!points.length) return;

    if (currentIndex >= points.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }

    setIsPlaying((value) => !value);
  };

  const handleFinish = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(points.length ? points.length - 1 : 0);
  }, [points.length]);

  const currentPoint = points[currentIndex] || points[0];

  const historyDuration = useMemo(() => {
    if (points.length < 2) return 0;

    return (
      new Date(points[points.length - 1].timestamp).getTime() -
      new Date(points[0].timestamp).getTime()
    );
  }, [points]);

  return (
    <div className="sf-playback-page">
      <aside className="sf-playback-sidebar">
        <div className="sf-playback-brand">
          <div>
            <div className="sf-playback-kicker">SyncFleet</div>
            <h1>Map Playback</h1>
          </div>

          <div className="sf-mode-switch">
            <Link to="/live">Live</Link>
            <span className="active">Playback</span>
          </div>
        </div>

        <section className="sf-filter-section">
          <div className="sf-filter-title">History</div>

          <label className="sf-field">
            <span>Device / IMEI</span>
            <select
              value={imei}
              onChange={(event) => setImei(event.target.value)}
              disabled={loadingDevices}
            >
              <option value="">
                {loadingDevices ? "Loading devices..." : "Select device"}
              </option>
              {devices.map((device) => (
                <option key={device._id} value={device.imei}>
                  {device.modelName || "GPS Device"} — {device.imei}
                </option>
              ))}
            </select>
          </label>

          <label className="sf-field">
            <span>Or enter IMEI manually</span>
            <input
              value={imei}
              onChange={(event) => setImei(event.target.value)}
              placeholder="Enter IMEI"
            />
          </label>

          <label className="sf-field">
            <span>From</span>
            <DatePicker
              selected={fromDate}
              onChange={handleFromChange}
              showTimeSelect
              timeIntervals={5}
              dateFormat="dd/MM/yyyy h:mm aa"
              placeholderText="Select start date/time"
              maxDate={new Date()}
              isClearable
            />
          </label>

          <label className="sf-field">
            <span>To</span>
            <DatePicker
              selected={toDate}
              onChange={handleToChange}
              showTimeSelect
              timeIntervals={5}
              dateFormat="dd/MM/yyyy h:mm aa"
              placeholderText="Select end date/time"
              minDate={fromDate || undefined}
              maxDate={maxEndDate || undefined}
              disabled={!fromDate}
              isClearable
            />
          </label>

          <div className="sf-range-rule">
            <strong>Maximum playback window: 24 hours</strong>
            <span>
              Example: 15/09/2026 12:00 PM → 16/09/2026 12:00 PM is valid.
            </span>
          </div>

          <button
            className="sf-fetch-button"
            onClick={fetchPlayback}
            disabled={loadingPlayback}
          >
            {loadingPlayback ? "Loading GPS history..." : "Load Playback"}
          </button>
        </section>

        {error && <div className="sf-error">{error}</div>}
        {info && <div className="sf-info">{info}</div>}

        {points.length > 0 && (
          <section className="sf-playback-controls">
            <div className="sf-section-heading">
              <span>Playback Controls</span>
              <span>{currentIndex + 1} / {points.length}</span>
            </div>

            <div className="sf-current-time">
              {formatPlaybackTime(
                currentPoint ? new Date(currentPoint.timestamp) : null
              )}
            </div>

            <input
              className="sf-timeline"
              type="range"
              min="0"
              max={points.length - 1}
              value={currentIndex}
              onChange={(event) => {
                setIsPlaying(false);
                setCurrentIndex(Number(event.target.value));
              }}
            />

            <div className="sf-timeline-labels">
              <span>{formatPlaybackTime(new Date(points[0].timestamp))}</span>
              <span>
                {formatPlaybackTime(
                  new Date(points[points.length - 1].timestamp)
                )}
              </span>
            </div>

            <div className="sf-control-row">
              <button onClick={restart}>↺ Restart</button>
              <button className="sf-play-button" onClick={togglePlayback}>
                {isPlaying ? "Ⅱ Pause" : "▶ Play"}
              </button>
            </div>

            <div className="sf-speed-row">
              <span>Speed</span>
              {SPEEDS.map((speed) => (
                <button
                  key={speed}
                  className={playbackSpeed === speed ? "selected" : ""}
                  onClick={() => setPlaybackSpeed(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="sf-stats">
              <div>
                <span>Coordinates</span>
                <strong>{points.length.toLocaleString()}</strong>
              </div>
              <div>
                <span>Recorded duration</span>
                <strong>{formatDuration(historyDuration)}</strong>
              </div>
              <div>
                <span>Current speed</span>
                <strong>{currentPoint?.speed ?? 0} km/h</strong>
              </div>
            </div>
          </section>
        )}
      </aside>

      <main className="sf-playback-content">
        {points.length ? (
          <PlaybackMap
            points={points}
            isPlaying={isPlaying}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            playbackSpeed={playbackSpeed}
            onFinish={handleFinish}
          />
        ) : (
          <div className="sf-empty-map">
            <div className="sf-empty-icon">⌖</div>
            <h2>Playback map</h2>
            <p>
              Select a device and a maximum 24-hour time window, then load the
              GPS history to draw and replay its route.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Playback;