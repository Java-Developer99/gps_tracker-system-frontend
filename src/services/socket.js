import io from "socket.io-client";

const socket = io("https://gpstrackersystem-production-3e30.up.railway.app",{
    transports: ["websocket"],
});

export default socket;
