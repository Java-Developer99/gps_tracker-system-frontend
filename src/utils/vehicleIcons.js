import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { FaBus, FaCar } from "react-icons/fa";

export function getVehicleIcon(type) {
  let iconComponent;
  switch (type) {
    case "bus":
      iconComponent = <FaBus style={{ color: "blue", fontSize: "24px" }} />;
      break;
    case "car":
      iconComponent = <FaCar style={{ color: "red", fontSize: "24px" }} />;
      break;
    default:
      iconComponent = <FaCar style={{ color: "gray", fontSize: "24px" }} />;
  }

  return L.divIcon({
    html: ReactDOMServer.renderToString(iconComponent),
    className: "",
    iconSize: [32, 32],
  });
}
