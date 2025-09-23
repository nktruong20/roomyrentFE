import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { logout, getMe } from "../services/authService";

export default function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ✅ Lấy user từ token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
        Swal.fire("Bạn chưa đăng nhập", "Vui lòng đăng nhập lại", "warning").then(
          () => navigate("/login")
        );
      }
    };
    fetchUser();
  }, [navigate]);

  // ✅ Menu
  const navItems = [
    { path: "/admin/dashboard", label: "Hệ thống quản lý", roles: ["boss"] },
    { path: "/admin/room", label: "Quản lý phòng", roles: ["boss", "assistant", "admin"] },
    { path: "/admin/schedules", label: "Quản lý lịch đặt phòng", roles: ["boss"] },
    { path: "/admin/staff", label: "Danh sách nhân sự", roles: ["boss", "assistant", "admin"] },
    { path: "/admin/transactions", label: "Giao dịch", roles: ["boss"] },
    { path: "/admin/my-schedules", label: "Lịch hẹn tư vấn xem nhà", roles: ["admin", "assistant"] },
  ];

  if (!user) return null;

  return (
    <header className="admin-header">
      <Link to="/" className="logo">
      RoomyRent Admin
    </Link>

      <nav>
        {navItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
      </nav>

      <div className="header-right">
        {/* boss mới thấy tạo tài khoản */}
        {user.role === "boss" && (
          <button
            className="create-btn"
            onClick={() => navigate("/admin/registermanage")}
          >
            <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: "8px" }} />
            Tạo tài khoản
          </button>
        )}

        {/* ✅ Icon user */}
        <button
          className="avatar-btn"
          onClick={() => navigate("/admin/administratorprofile")}
        >
          <FontAwesomeIcon icon={faUser} size="lg" />
        </button>
      </div>

      <style>{`
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 30px;
          background: #111827;
          color: white;
          font-family: "Inter", sans-serif;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .logo {
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        nav {
          display: flex;
          gap: 20px;
        }

        nav a {
          padding: 6px 14px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 500;
          color: #d1d5db;
          transition: all 0.25s ease;
        }

        nav a:hover {
          color: #a78bfa;
        }

        nav a.active {
          background: rgba(99,102,241,0.15);
          color: #a78bfa;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .create-btn {
          background: #6366f1;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .create-btn:hover {
          background: #4f46e5;
          transform: scale(1.05);
        }

        .avatar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          background: rgba(99,102,241,0.2);
          border: 2px solid #6366f1;
          color: #a78bfa;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .avatar-btn:hover {
          background: rgba(99,102,241,0.3);
          transform: scale(1.05);
        }
      `}</style>
    </header>
  );
}
