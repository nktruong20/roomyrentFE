
import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserPlus,
  faUser,
  faChartLine,
  faBuilding,
  faCalendarAlt,
  faUsers,
  faArrowRightFromBracket,
  faBars,
  faChevronLeft,
  faClipboardList,
  faUserShield, // icon logo admin
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { logout, getMe } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) {
        Swal.fire("Bạn chưa đăng nhập", "Vui lòng đăng nhập lại", "warning").then(() =>
          navigate("/login")
        );
      }
    })();
  }, [navigate]);

  const navItems = [
    { path: "/", label: "Trang chính", icon: faHome, roles: ["boss", "assistant", "admin"] },
    { path: "/admin/dashboard", label: "Hệ thống quản lý", icon: faChartLine, roles: ["boss"] },
    { path: "/admin/room", label: "Quản lý phòng", icon: faBuilding, roles: ["boss", "assistant", "admin"] },
    { path: "/admin/schedules", label: "Quản lý đặt phòng", icon: faCalendarAlt, roles: ["boss"] },
    { path: "/admin/my-schedules", label: "Lịch hẹn xem phòng", icon: faClipboardList, roles: ["assistant", "admin"] },
    { path: "/admin/staff", label: "Danh sách nhân sự", icon: faUsers, roles: ["boss", "assistant", "admin"] },
    { path: "/admin/administratorprofile", label: "Hồ sơ quản trị", icon: faUser, roles: ["boss","assistant","admin"] },
  ];

  if (!user) return null;

  const handleLogout = async () => {
    const res = await Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn chắc chắn muốn đăng xuất?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#000",
    });
    if (res.isConfirmed) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.4 }}
        className="sidebar"
      >
        <div className="top">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="logo"
            >
              <FontAwesomeIcon icon={faUserShield} className="logo-icon"/>
              <span>Admin Panel</span>
            </motion.div>
          )}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <FontAwesomeIcon icon={collapsed ? faBars : faChevronLeft} />
          </button>
        </div>

        <nav className="menu">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => "menu-item" + (isActive ? " active" : "")}
              >
                <FontAwesomeIcon icon={item.icon} className="menu-icon" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
        </nav>

        <div className="sidebar-bottom">
          {user.role === "boss" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="create-btn"
              onClick={() => navigate("/admin/registermanage")}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              {!collapsed && <span>Tạo tài khoản</span>}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="logout-btn"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            {!collapsed && <span>Đăng xuất</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.5 }}
        className={`content ${location.pathname === "/admin/registermanage" ? "no-padding" : ""}`}
      >
        <Outlet />
      </motion.main>

      <style>{css}</style>
    </div>
  );
}

const css = `
.admin-layout {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif;
}
.sidebar {
  background: #111; /* sidebar đen */
  color: white;
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
  box-shadow: 4px 0 16px rgba(0,0,0,0.4);
  transition: all 0.3s ease;
}
.sidebar .top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 800;
}
.logo-icon {
  font-size: 22px;
  color: white;
}
.collapse-btn {
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}
.collapse-btn:hover {
  transform: scale(1.2);
  color: #fff;
}
.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #aaa;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}
.menu-item:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
  transform: translateX(6px);
}
.menu-item.active {
  background: white;
  color: black;
  font-weight: 600;
}
.menu-icon { font-size: 16px; }
.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.create-btn, .logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.25s ease;
}
.create-btn {
  background: white;
  color: black;
}
.create-btn:hover {
  background: #e5e5e5;
  transform: translateY(-2px);
}
.logout-btn {
  background: black;
  color: white;
  border: 1px solid #fff;
}
.logout-btn:hover {
  background: #222;
  transform: translateY(-2px);
}
.content {
  flex: 1;
  background: #fff; /* main trắng */
  color: #111;
  overflow-y: auto;
  padding: 24px;
  transition: all 0.4s ease;
}
.content.no-padding {
  padding: 0 !important;
  background: #000 !important;
  color: white !important;
}
`;


