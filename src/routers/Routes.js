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

function AppRoutes(){

    return(
        <Routes>
            <Route element={<AppShell/>}>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/report" element={<ReportPage/>}/>
            <Route path="/live" element={<MapPage/>}/>
            <Route path="/playback" element={<Playback/>}/>

            {/* Dealer */}
            <Route path="/dealers" element={<DealerList/>}/>
            <Route path="/dealers/add" element={<AddDealer/>}/>
            <Route path="/dealers/:id" element={<DealerView/>}/>
            <Route path="/dealers/edit/:id" element={<EditDealer/>}/>

            {/* subdealer */}
            <Route path="/subDealers" element={<SubDealerList/>}/>
            <Route path="/subDealer/add" element={<SubDealerAdd/>}/>
            <Route path="/subDealer/:id" element={<SubDealerView/>}/>
            <Route path="/subDealer/edit/:id" element={<SubDealerEdit/>}/>

            {/* company */}
            <Route path="/companies" element={<CompanyList/>}/>
            <Route path="/companies/add" element={<CompanyAdd/>}/>
            <Route path="/companies/edit/:id" element={<CompanyEdit/>}/>
            <Route path="/companies/:id" element={<CompanyView/>}/>

            {/* branch */}
            <Route path="/branches" element={<BranchList/>}/>
            <Route path="/branches/add" element={<BranchAdd/>}/>
            <Route path="/branches/edit/:id" element={<BranchEdit/>}/>
            <Route path="/branches/:id" element={<BranchView/>}/> 

            {/* vehicle */}
            <Route path="vehicles" element={<VehicleList/>}/>
            <Route path="/vehicles/add" element={<VehicleAdd/>}/>
            <Route path="/vehicles/edit/:id" element={<VehicleEdit/>}/>
            <Route path="/vehicles/:id" element={<VehicleView/>}/>

            {/* Sims */}
            <Route path="/sims" element={<SimList/>}/>
            <Route path="/sims/add" element={<SimAdd/>}/>
            <Route path="/sims/edit/:id" element={<SimEdit/>}/>
            <Route path="/sims/:id" element={<SimView/>}/>
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
    )
}
export default AppRoutes;