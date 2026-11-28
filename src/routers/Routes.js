import ReportPage from "../components/pages/ReportPage";
import { Routes, Route, Navigate } from "react-router-dom";
import MapPage from "../components/pages/MapPage";
import Playback from "../components/pages/Playback";
import AppShell from "../app/AppShell";
import Dashboard from "../components/pages/Dashboard";
import DealerList from "../components/dealers/DealerList";
import AddDealer from "../components/dealers/AddDealer";
import DealerView from "../components/dealers/DealerView";
import EditDealer from "../components/dealers/EditDealer";
import SubDealerList from "../components/subDealers/SubDealerList";
import SubDealerAdd from "../components/subDealers/SubDealerAdd";
import SubDealerView from "../components/subDealers/SubDealerView";
import SubDealerEdit from "../components/subDealers/SubDealerEdit";
import CompanyList from "../components/companies/CompanyList";
import CompanyAdd from "../components/companies/CompanyAdd";
import CompanyEdit from "../components/companies/CompanyEdit";
import CompanyView from "../components/companies/CompanyView";
import BranchList from "../components/branches/BranchList";
import BranchAdd from "../components/branches/BranchAdd";
import BranchEdit from "../components/branches/BranchEdit";
import BranchView from "../components/branches/BranchView";
import VehicleList from "../components/vehicles/VehicleList";
import VehicleAdd from "../components/vehicles/VehicleAdd";
import VehicleEdit from "../components/vehicles/VehicleEdit";
import VehicleView from "../components/vehicles/VehicleView";
import SimList from "../components/sim/SimList";
import SimAdd from "../components/sim/SimAdd";
import SimEdit from "../components/sim/SimEdit";
import SimView from "../components/sim/SimView";
import Login from "../components/auth/Login";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import About from "../components/pages/About";
import DeviceList from "../components/devices/DeviceList";
import DeviceView from "../components/devices/DeviceView";
import DeviceAdd from "../components/devices/DeviceAdd";
import DeviceEdit from "../components/devices/DeviceEdit";
import UserList from "../components/user/UserList";
import AddUser from "../components/user/AddUser";
import EditUser from "../components/user/EditUser";
import UserView from "../components/user/UserView";
import UserPermission from "../components/permissions/UserPermission";
import UserTypePermission from "../components/permissions/UserTypePermission";

function AppRoutes() {
    return (
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About/>}/>
  
        {/* Protected application routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/live" element={<MapPage />} />
            <Route path="/playback" element={<Playback />} />
  
            {/* Dealer */}
            <Route path="/dealers" element={<DealerList />} />
            <Route path="/dealers/add" element={<AddDealer />} />
            <Route path="/dealers/:id" element={<DealerView />} />
            <Route path="/dealers/edit/:id" element={<EditDealer />} />
  
            {/* SubDealer */}
            <Route path="/subDealers" element={<SubDealerList />} />
            <Route path="/subDealer/add" element={<SubDealerAdd />} />
            <Route path="/subDealer/:id" element={<SubDealerView />} />
            <Route path="/subDealer/edit/:id" element={<SubDealerEdit />} />
  
            {/* Company */}
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/companies/add" element={<CompanyAdd />} />
            <Route path="/companies/edit/:id" element={<CompanyEdit />} />
            <Route path="/companies/:id" element={<CompanyView />} />
  
            {/* Branch */}
            <Route path="/branches" element={<BranchList />} />
            <Route path="/branches/add" element={<BranchAdd />} />
            <Route path="/branches/edit/:id" element={<BranchEdit />} />
            <Route path="/branches/:id" element={<BranchView />} />
  
            {/* Vehicle */}
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/add" element={<VehicleAdd />} />
            <Route path="/vehicles/edit/:id" element={<VehicleEdit />} />
            <Route path="/vehicles/:id" element={<VehicleView />} />
  
            {/* SIM */}
            <Route path="/sims" element={<SimList />} />
            <Route path="/sims/add" element={<SimAdd />} />
            <Route path="/sims/edit/:id" element={<SimEdit />} />
            <Route path="/sims/:id" element={<SimView />} />

            {/* Device */}
            <Route path="/device" element={<DeviceList/>}/>
            <Route path="/device/add" element={<DeviceAdd/>}/>
            <Route path="/device/:id" element={<DeviceView/>}/>
            <Route path="/device/edit/:id" element={<DeviceEdit/>}/>

            {/* User */}
            <Route path="/user" element={<UserList/>}/>
            <Route path="/user/add" element={<AddUser/>}/>
            <Route path="/user/edit/:id" element={<EditUser/>}/>
            <Route path="/user/:id" element={<UserView/>}/>

            {/* UserPermissions */}
            <Route path="/user-permissions" element={<UserPermission/>}/>
            <Route path="/userType-permissions" element={<UserTypePermission/>}/>

            
          </Route>
        </Route>
  
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
export default AppRoutes;