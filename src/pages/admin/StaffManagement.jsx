import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiEye,
  FiXCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  getStaff,
  updateStaff,
  deleteStaff,
  getMe,
} from "../../services/authService";

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    commission_percent: 0,
  });

  // Toast helper
  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  // Fetch current user
  const fetchMe = async () => {
    try {
      const me = await getMe();
      setCurrentUser(me);
    } catch {
      setCurrentUser(null);
    }
  };

  // Lấy danh sách nhân sự
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaff();
      setStaff(data);
    } catch (err) {
      Swal.fire("❌ Lỗi", err.message || "Không thể tải danh sách nhân sự", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchStaff();
  }, []);

  // Mở modal edit
  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      commission_percent: user.commission_percent,
    });
  };

  // Lưu chỉnh sửa
  const saveEdit = async () => {
    try {
      await updateStaff(editingUser._id, formData);
      showToast("success", "✅ Cập nhật nhân sự thành công");
      setEditingUser(null);
      fetchStaff();
    } catch (err) {
      Swal.fire("❌ Lỗi", err.message || "Không thể cập nhật nhân sự", "error");
    }
  };

  // Xóa nhân sự
  const handleDelete = async (id) => {
    Swal.fire({
      title: "⚠️ Bạn có chắc chắn?",
      text: "Hành động này sẽ xóa nhân sự vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "🗑️ Xóa",
      cancelButtonText: "❌ Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteStaff(id);
          showToast("success", "🗑️ Đã xóa thành công");
          fetchStaff();
        } catch (err) {
          Swal.fire("❌ Lỗi", err.message || "Không thể xóa nhân sự", "error");
        }
      }
    });
  };

  return (
    <>
      <div className="dashboard">
        {/* Title */}
        <div className="title-box">
          <FiUsers className="title-icon" />
          <h1 className="title">Human Resource Management</h1>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <p style={{ textAlign: "center", padding: 20 }}>⏳ Đang tải...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên nhân sự</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Địa chỉ</th>
                  <th>Vai trò</th>
                  {currentUser?.role === "boss" && <th>% Hoa hồng</th>}
                  {currentUser?.role === "boss" && <th>Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {staff.length > 0 ? (
                  staff.map((user, i) => (
                    <tr key={user._id}>
                      <td>{i + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "—"}</td>
                      <td>{user.address || "—"}</td>
                      <td>
                        <span
                          className={`status ${
                            user.role === "admin"
                              ? "active"
                              : user.role === "assistant"
                              ? "other"
                              : "inactive"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {currentUser?.role === "boss" && (
                        <td>{user.commission_percent}%</td>
                      )}
                      {currentUser?.role === "boss" && (
                        <td>
                          <button
                            className="icon-btn edit"
                            onClick={() => openEdit(user)}
                            title="Sửa"
                          >
                            <FiEye />
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={() => handleDelete(user._id)}
                            title="Xóa"
                          >
                            <FiXCircle />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={currentUser?.role === "boss" ? 8 : 6}
                      style={{ textAlign: "center", padding: 20 }}
                    >
                      ❌ Không có nhân sự
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Edit giữ nguyên giao diện */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: -50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -50, opacity: 0 }}
            >
              <h2>✏️ Sửa nhân sự</h2>
              <input
                type="text"
                placeholder="Tên"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="SĐT"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="% Hoa hồng"
                value={formData.commission_percent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission_percent: Number(e.target.value),
                  })
                }
              />

              <div className="modal-actions">
                <button className="btn save" onClick={saveEdit}>
                  💾 Lưu
                </button>
                <button
                  className="btn cancel"
                  onClick={() => setEditingUser(null)}
                >
                  ❌ Hủy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS */}
      <style>{`
        body {
          background: #f3f4f6;
          font-family: "Inter", sans-serif;
        }
        .dashboard {
          padding: 40px;
          min-height: 100vh;
        }
        /* Title */
        .title-box {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 30px;
          padding: 22px 28px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
        .title-icon {
          font-size: 32px;
          color: #6366f1;
          animation: pulse 2s infinite;
        }
        .title {
          font-size: 26px;
          font-weight: 800;
          color: #4f46e5;
        }
        /* Table */
        .table-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.08);
          padding: 25px;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 16px 20px;
          text-align: left;
          font-size: 14px;
        }
        th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          font-size: 13px;
        }
        tbody tr {
          transition: all 0.3s ease;
        }
        tbody tr:hover {
          background: #f3f4f6;
          transform: scale(1.01);
        }
        .status {
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status.active {
          background: #d1fae5;
          color: #065f46;
        }
        .status.other {
          background: #fef3c7;
          color: #92400e;
        }
        .status.inactive {
          background: #fee2e2;
          color: #b91c1c;
        }
        .icon-btn {
          border: none;
          padding: 8px;
          border-radius: 8px;
          margin-right: 6px;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn.edit {
          background: #3b82f6;
          color: white;
        }
        .icon-btn.edit:hover {
          background: #2563eb;
        }
        .icon-btn.delete {
          background: #ef4444;
          color: white;
        }
        .icon-btn.delete:hover {
          background: #dc2626;
        }
        /* Modal */
        .modal-overlay {
          position: fixed;
          top:0; left:0; right:0; bottom:0;
          background: rgba(0,0,0,0.5);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 20px;
          width: 400px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .modal-content h2 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #4f46e5;
        }
        .modal-content input {
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: 0.2s;
        }
        .modal-content input:focus {
          border-color: #6366f1;
          outline: none;
          box-shadow: 0 0 0 2px #c7d2fe;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }
        .btn {
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .btn.save {
          background: linear-gradient(90deg,#4f46e5,#6366f1);
          color: white;
        }
        .btn.cancel {
          background: #e5e7eb;
          color: #374151;
        }
        /* Animation */
        @keyframes pulse {
          0%,100% { transform: scale(1);}
          50% { transform: scale(1.15);}
        }
      `}</style>
    </>
  );
}
