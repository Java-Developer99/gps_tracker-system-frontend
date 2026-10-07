import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import "../css/Layout.css"

function AppShell() {
  return (
    <div className="sf-app-shell">
      <Sidebar />

      <div className="sf-main-area">
        <Header />

        <main className="sf-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;