import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHeader() {
  const [open, setOpen] = useState(false);

  const notifications = [
    { id: 1, message: "Có người dùng mới đăng ký.", time: "2 phút trước" },
    { id: 2, message: "Phòng 203 vừa được đặt.", time: "10 phút trước" },
    { id: 3, message: "Admin đã cập nhật hệ thống.", time: "1 giờ trước" },
  ];

  return (
    <header className="admin-header">
      <h2>Trang quản trị</h2>

      <div className="header-right">
        <motion.div
          className="notification-bell"
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
        >
          <FontAwesomeIcon icon={faBell} />
          {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="dropdown"
            >
              {notifications.map((n) => (
                <div key={n.id} className="dropdown-item">
                  <p>{n.message}</p>
                  <span>{n.time}</span>
                </div>
              ))}
              {notifications.length === 0 && <p className="empty">Không có thông báo</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{css}</style>
    </header>
  );
}

const css = `
.admin-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}
.admin-header h2 { font-size: 18px; font-weight: 600; color: #111; }
.header-right { display: flex; align-items: center; gap: 16px; position: relative; }
.notification-bell { position: relative; font-size: 20px; cursor: pointer; color: #111; }
.badge { position: absolute; top: -6px; right: -8px; background: #ef4444; color: white; font-size: 12px; padding: 2px 6px; border-radius: 50%; }
.dropdown {
  position: absolute; top: 36px; right: 0; width: 260px; background: #fff;
  border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.dropdown-item { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; }
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item p { margin: 0; font-size: 14px; color: #111; }
.dropdown-item span { font-size: 12px; color: #6b7280; }
.empty { padding: 14px; text-align: center; color: #6b7280; }
`;
