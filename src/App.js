
import './App.css';
import AppRoutes from './routers/Routes';
import { BrowserRouter } from "react-router-dom";
import { PermissionProvider } from "./context/PermissionContext";

function App() {
  return (
    <BrowserRouter>
      <PermissionProvider>
        <AppRoutes />
      </PermissionProvider>
    </BrowserRouter>
  );
}

export default App;
