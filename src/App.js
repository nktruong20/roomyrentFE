import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoomList from "./pages/RoomList";
import DetailRoom from "./pages/DetailRoom";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Explore from "./pages/Explore";
import Favourite from "./pages/Favourite";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import ScheduleManagement from "./pages/admin/ScheduleManagement";
import RegisterManagement from "./pages/admin/RegisterManagement";
import RoomManagement from "./pages/admin/RoomManagement";
import DetailRoomManagement from "./pages/admin/DetailRoomManagement";
import AssignmentSchedule from "./pages/admin/AssignmentSchedule";
import AdministratorProfile from "./pages/admin/AdministratorProfile";

// Components
import PrivateRoute from "./components/PrivateRoute";
import SidebarAdmin from "./components/SidebarAdmin";

function App() {
  const adminRoles = ["boss", "assistant", "admin"];

  return (
    <Router>
      <Routes>
        {/* Redirect mặc định */}
        <Route path="/" element={<Navigate to="/rooms" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/favourite" element={<Favourite />} />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/rooms/:id" element={<DetailRoom />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={adminRoles}>
              <SidebarAdmin />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="room" element={<RoomManagement />} />
          <Route path="room/:id" element={<DetailRoomManagement />} />
          <Route path="schedules" element={<ScheduleManagement />} />
          <Route path="my-schedules" element={<AssignmentSchedule />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="registermanage" element={<RegisterManagement />} />
          <Route path="administratorprofile" element={<AdministratorProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<h2 style={{ padding: 24 }}>404 - Trang không tồn tại</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
