import { useEffect, useState, useRef } from "react";
import socket from "../../services/socket";
import LiveMap from "../map/LiveMap";
import { Link } from "react-router-dom";

function MapPage() {
  const [coords, setCoords] = useState({ lat: 19.2, lng: 72.9 });
  const [vehicleType, setVehicleType] = useState("car");
  const [speed, setSpeed] = useState(0);
  const [mileage, setMileage] = useState(0);

  // Keep a ref of the latest coords
  const coordsRef = useRef(coords);
  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  useEffect(() => {
    function animateMarker(prev, next) {
      let step = 0;
      const steps = 20;
      const interval = setInterval(() => {
        step++;
        const lat = prev.lat + (next.lat - prev.lat) * (step / steps);
        const lng = prev.lng + (next.lng - prev.lng) * (step / steps);

        if (!isNaN(lat) && !isNaN(lng)) {
          setCoords({ lat, lng });
        }

        if (step >= steps) clearInterval(interval);
      }, 200);
    }

    socket.on("gps-data", (data) => {
      console.log("Received gps-data:", data);

      // Animate from latest coords to new coords
      animateMarker(coordsRef.current, { lat: data.lat, lng: data.long });

      setSpeed(data.speed);
      setMileage(data.mileage);
    });

    return () => socket.off("gps-data");
  }, []); // ✅ run once, not on every coords change

  return (

    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          top: 15,
          left: 45,
          display: "flex",
          gap: 8,
          padding: 5,
          borderRadius: 8,
          background: "#171720",
          boxShadow: "0 3px 12px rgba(0,0,0,.3)",
        }}
      >
        <span
          style={{
            padding: "8px 11px",
            color: "#fff",
            borderRadius: 6,
            background: "#39394a",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Live
        </span>

        <Link
          to="/playback"
          style={{
            padding: "8px 11px",
            color: "#d8c8ff",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Playback
        </Link>
      </div>

      <LiveMap
        lat={coords.lat}
        lng={coords.lng}
        vehicleType={vehicleType}
        speed={speed}
        mileage={mileage}
      />
    </div>
  );
}

export default MapPage;
