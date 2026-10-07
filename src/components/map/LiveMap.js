import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { FaBus } from "react-icons/fa";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

function LiveMap({ lat = 19.076, lng = 72.8777, speed = 0, mileage = 0 }) {
    // Default bus icon
    const busIcon = L.divIcon({
        html: ReactDOMServer.renderToString(<FaBus style={{ color: "blue", fontSize: "24px" }} />),
        className: "",
        iconSize: [32, 32],
    });

    function RecenterMap({ lat, lng }) {
        const map = useMap();
        useEffect(() => {
            map.setView([lat, lng]);
        }, [lat, lng, map]);
        return null;
    }
    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <RecenterMap lat={lat} lng={lng} />
                <Marker position={[lat, lng]} icon={busIcon}>
                    <Popup>
                        <strong>BUS</strong><br />
                        Speed: {speed} km/h<br />
                        Mileage: {mileage} km
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default LiveMap;
