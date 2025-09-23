import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserShield,
  FaCamera,
  FaHome,
  FaClock,
  FaSignOutAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

// Services
import { getMe, updateUser } from "../services/authService";
import {
  getMySchedules,
  subscribeSchedules,
  unsubscribeSchedules,
} from "../services/scheduleService";
import { getCommissions } from "../services/commissionService";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [revenues, setRevenues] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const fileInputRef = useRef(null);

  // === Pagination states ===
  const [revPage, setRevPage] = useState(1);
  const [hisPage, setHisPage] = useState(1);
  const REV_PER_PAGE = 4;
  const HIS_PER_PAGE = 6;

  // Animation variants
  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // ✅ Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await getMe();
        setUser(me);
        setFormData(me);
      } catch (err) {
        console.log("❌ Lỗi fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch revenues (commission)
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        if (!user) return;
        const res = await getCommissions({ page: 1, pageSize: 100 });
        const data = res.data || res;
        const list = data.data || data;

        console.log("📊 Revenues API:", list);
        setRevenues(Array.isArray(list) ? list : []);
        const total = (Array.isArray(list) ? list : []).reduce(
          (sum, c) => sum + (c.amount || 0),
          0
        );
        setTotalRevenue(total);
      } catch (err) {
        console.log("❌ Lỗi fetch revenues:", err);
      }
    };
    if (activeTab === "revenue") fetchRevenue();
  }, [activeTab, user]);

  // ✅ Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const mySchedules = await getMySchedules();
        setSchedules(mySchedules);
      } catch (err) {
        console.log("❌ Lỗi fetch schedules:", err);
      }
    };
    fetchSchedules();
  }, []);

  // ✅ Socket subscribe
  useEffect(() => {
    if (!user?._id) return;

    subscribeSchedules(
      (newSchedule) => {
        if (
          newSchedule.create_by?._id === user?._id ||
          newSchedule.assigned_user_id?._id === user?._id
        ) {
          setSchedules((prev) => {
            const exists = prev.some((s) => s._id === newSchedule._id);
            if (exists) return prev;
            return [newSchedule, ...prev];
          });
        }
      },
      (updated) => {
        if (
          updated.create_by?._id === user?._id ||
          updated.assigned_user_id?._id === user?._id
        ) {
          setSchedules((prev) =>
            prev
              .map((s) => (s._id === updated._id ? updated : s))
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          );
        }
      },
      (deletedId) => {
        setSchedules((prev) => prev.filter((s) => s._id !== deletedId));
      }
    );

    return () => unsubscribeSchedules();
  }, [user?._id]);

  // ✅ Polling schedules
  useEffect(() => {
    const doPoll = async () => {
      try {
        const mySchedules = await getMySchedules();
        setSchedules(mySchedules);
      } catch (err) {
        console.log("❌ Lỗi polling schedules:", err);
      }
    };
    doPoll();
    const interval = setInterval(doPoll, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reset page index khi data thay đổi
  useEffect(() => setRevPage(1), [revenues]);
  useEffect(() => setHisPage(1), [schedules]);

  // ===== Helpers =====
  const paginate = (arr, page, perPage) => {
    const start = (page - 1) * perPage;
    return arr.slice(start, start + perPage);
  };
  const pageCount = (arr, perPage) =>
    Math.max(1, Math.ceil(arr.length / perPage));

  const revs = [...revenues].sort(
    (a, b) => new Date(b.createdAt || b.create_at || 0) - new Date(a.createdAt || a.create_at || 0)
  );
  const schs = [...schedules].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt || 0) -
      new Date(a.updatedAt || a.createdAt || 0)
  );

  const revTotal = pageCount(revs, REV_PER_PAGE);
  const hisTotal = pageCount(schs, HIS_PER_PAGE);
  const revPageItems = paginate(revs, revPage, REV_PER_PAGE);
  const hisPageItems = paginate(schs, hisPage, HIS_PER_PAGE);

  // ===== Handlers =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updated = await updateUser(formData);
      setUser(updated);
      setFormData(updated);
      setEditMode(false);
      Swal.fire("Thành công", "Cập nhật thông tin thành công!", "success");
    } catch (err) {
      Swal.fire("Lỗi", "Không thể cập nhật thông tin", "error");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Bạn chắc chắn muốn đăng xuất?",
      text: "Bạn sẽ phải đăng nhập lại để tiếp tục.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      Swal.fire("Đăng xuất thành công!", "", "success").then(() => {
        window.location.replace("/");
      });
    }
  };

  if (!user) {
    return (
      <div style={{ paddingTop: 80 }}>
        <Header />
        <p style={{ padding: 40 }}>⏳ Đang tải thông tin người dùng...</p>
        <Footer />
      </div>
    );
  }

  // renderStatus
  const renderStatus = (status) => {
    switch (status) {
      case "done":
        return (
          <span style={{ color: "#16a34a", fontWeight: 600 }}>✅ Hoàn thành</span>
        );
      case "canceled":
        return (
          <span style={{ color: "#dc2626", fontWeight: 600 }}>❌ Đã hủy</span>
        );
      case "assigned":
        return (
          <span style={{ color: "#2563eb", fontWeight: 600 }}>
            📌 Đang chờ nhân sự chấp nhận
          </span>
        );
      case "accepted":
        return (
          <span style={{ color: "#0ea5e9", fontWeight: 600 }}>
            🤝 Đã chấp nhận – chờ đi xem
          </span>
        );
      case "pending":
        return (
          <span style={{ color: "#a16207", fontWeight: 600 }}>⏳ Chờ xử lý</span>
        );
      default:
        return (
          <span style={{ color: "#6b7280", fontWeight: 600 }}>❓ Không rõ</span>
        );
    }
  };

  return (
    <div style={{ paddingTop: 80 }}>
      <Header />
      <div style={styles.page}>
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Left */}
          <motion.div
            style={styles.left}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div style={styles.avatarBox}>
              <img
                src={formData.avatar || "https://i.pravatar.cc/150"}
                alt="avatar"
                style={styles.avatar}
              />
              <button
                style={styles.changeAvatarBtn}
                onClick={() => fileInputRef.current.click()}
              >
                <FaCamera />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>
            <h2 style={styles.name}>{user.name}</h2>
            <p style={styles.email}>{user.email}</p>
            <div style={styles.logoutBox}>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <FaSignOutAlt style={{ marginRight: 10 }} /> Đăng xuất
              </button>
            </div>
          </motion.div>

          {/* Right */}
          <div style={styles.right}>
            {/* Tabs */}
            <div style={styles.tabs}>
              {["info", "revenue", "history"].map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...styles.tabBtn,
                    ...(activeTab === tab ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "info"
                    ? "Thông tin cá nhân"
                    : tab === "revenue"
                    ? "Doanh thu"
                    : "Lịch sử đặt lịch"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  style={styles.infoBox}
                  variants={fadeVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Họ tên"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Email"
                      />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Số điện thoại"
                      />
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Địa chỉ"
                      />
                      <div style={styles.actions}>
                        <button onClick={handleSave} style={styles.saveBtn}>
                          Lưu
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setFormData({ ...user });
                          }}
                          style={styles.cancelBtn}
                        >
                          Hủy
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={styles.item}>
                        <FaPhone style={styles.iconInline} />{" "}
                        {user.phone || "—"}
                      </p>
                      <p style={styles.item}>
                        <FaMapMarkerAlt style={styles.iconInline} />{" "}
                        {user.address || "—"}
                      </p>
                      <p style={styles.item}>
                        <FaCalendarAlt style={styles.iconInline} /> Ngày tham
                        gia:{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                          : "Không rõ"}
                      </p>
                      <p style={styles.item}>
                        <FaUserShield style={styles.iconInline} /> Vai trò:{" "}
                        {user.role || "Người dùng"}
                      </p>
                      <button
                        style={styles.editBtn}
                        onClick={() => setEditMode(true)}
                      >
                        Chỉnh sửa thông tin
                      </button>
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "revenue" && (
                <motion.div
                  key="revenue"
                  style={styles.roomsBox}
                  variants={fadeVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {revenues.length === 0 ? (
                    <p style={{ color: "#6b7280" }}>Bạn chưa có doanh thu nào.</p>
                  ) : (
                    <>
                      <h3 style={{ color: "#16a34a" }}>
                        Tổng: {totalRevenue.toLocaleString("vi-VN")} VND (
                        {revenues.length} giao dịch)
                      </h3>
                      {revPageItems.map((rev) => (
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          key={rev._id}
                          style={styles.roomCard}
                        >
                          <FaMoneyBillWave
                            style={{ fontSize: 28, color: "#10b981" }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4 style={styles.roomTitle}>
                              {rev.room_id?.apartmentName || "Phòng"}
                            </h4>
                            <p style={styles.roomInfo}>
                              Giá phòng:{" "}
                              {rev.room_price?.toLocaleString("vi-VN")} VND
                            </p>
                            <p style={styles.roomInfo}>
                              Doanh thu sau hoa hồng:{" "}
                              {(rev.room_price - rev.amount).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </p>
                            <p style={styles.roomPrice}>
                              Hoa hồng: {rev.commission_percent}% ={" "}
                              {rev.amount.toLocaleString("vi-VN")} VND
                            </p>
                            <p style={styles.roomInfo}>
                              Ngày:{" "}
                              {new Date(
                                rev.createdAt || rev.create_at
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <Pagination
                        current={revPage}
                        total={revTotal}
                        onChange={setRevPage}
                        label="rev"
                      />
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  style={styles.historyBox}
                  variants={fadeVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {schs.length === 0 ? (
                    <p style={{ color: "#6b7280" }}>
                      Bạn chưa có lịch đặt phòng nào.
                    </p>
                  ) : (
                    <>
                      {hisPageItems.map((sch) => (
                        <motion.div
                          key={sch._id}
                          style={styles.historyItem}
                          whileHover={{ scale: 1.02 }}
                        >
                          <FaHome style={{ color: "#8a5cff" }} />
                          <div>
                            <p style={styles.historyRoom}>
                              {sch.room_id?.apartmentName || "Phòng không rõ"}
                            </p>
                            <p style={styles.historyDate}>
                              <FaClock style={styles.iconInline} />{" "}
                              {new Date(
                                sch.scheduled_time
                              ).toLocaleString("vi-VN")}{" "}
                              — {renderStatus(sch.status)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <Pagination
                        current={hisPage}
                        total={hisTotal}
                        onChange={setHisPage}
                        label="his"
                      />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

function Pagination({ current, total, onChange, label }) {
  const pages = (() => {
    const span = 5;
    if (total <= span) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - Math.floor(span / 2));
    let end = start + span - 1;
    if (end > total) {
      end = total;
      start = end - span + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  const go = (p) => onChange(Math.min(Math.max(1, p), total));

  return (
    <div className="pagination-pretty" aria-label={`pagination-${label}`}>
      <button
        className="pg-btn square"
        onClick={() => go(1)}
        disabled={current === 1}
        aria-label="Trang đầu"
      >
        «
      </button>
      <button
        className="pg-btn square"
        onClick={() => go(current - 1)}
        disabled={current === 1}
        aria-label="Trang trước"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={`${label}-${p}`}
          className={`pg-btn ${p === current ? "active" : ""}`}
          onClick={() => go(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="pg-btn square"
        onClick={() => go(current + 1)}
        disabled={current === total}
        aria-label="Trang sau"
      >
        ›
      </button>
      <button
        className="pg-btn square"
        onClick={() => go(total)}
        disabled={current === total}
        aria-label="Trang cuối"
      >
        »
      </button>

      <style>{`
        .pagination-pretty{
          display:flex; gap:10px; align-items:center; justify-content:center;
          margin-top:14px;
        }
        .pg-btn{
          min-width:44px; height:38px; padding:0 12px;
          border:1.5px solid #8b5cf6; background:#fff; color:#6d28d9;
          border-radius:12px; font-weight:700; cursor:pointer;
          transition:transform .15s ease, box-shadow .2s ease, background .2s ease;
        }
        .pg-btn:hover:not(:disabled){ transform: translateY(-1px); }
        .pg-btn:disabled{ opacity:.4; cursor:not-allowed; }
        .pg-btn.square{ width:44px; padding:0; }
        .pg-btn.active{
          background:#7c3aed; color:#fff; border-color:transparent;
          box-shadow:0 6px 16px rgba(124,58,237,.35);
        }
      `}</style>
    </div>
  );
}

/* ---------------- Inline styles ---------------- */
const styles = {
  logoutBox: { marginTop: 20 },
  logoutBtn: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    width: 220,
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  },
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f5f7fa,#e4e9f7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    display: "flex",
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    maxWidth: 1100,
    width: "100%",
    padding: 40,
    gap: 40,
  },
  left: {
    flexBasis: "30%",
    textAlign: "center",
    borderRight: "1px solid #eee",
    paddingRight: 30,
  },
  avatarBox: { position: "relative", width: 160, height: 160, margin: "0 auto" },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #8a5cff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  changeAvatarBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    background: "#8a5cff",
    border: "none",
    color: "#fff",
    borderRadius: "50%",
    width: 36,
    height: 36,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 22, fontWeight: 700, marginTop: 15, marginBottom: 5 },
  email: { fontSize: 14, color: "#6b7280" },
  right: { flex: 1, display: "flex", flexDirection: "column", gap: 20 },
  tabs: { display: "flex", gap: 12, marginBottom: 10 },
  tabBtn: {
    flex: 1,
    padding: "12px 0",
    border: "1px solid #ddd",
    borderRadius: 12,
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    color: "#374151",
    transition: "all 0.3s",
  },
  tabActive: {
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    border: "1px solid #8a5cff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  infoBox: { display: "flex", flexDirection: "column", gap: 12 },
  item: { fontSize: 15, color: "#374151", display: "flex", gap: 8 },
  iconInline: { color: "#8a5cff" },
  editBtn: {
    marginTop: 15,
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    width: 220,
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  },
  input: {
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
    transition: "all 0.2s",
  },
  actions: { display: "flex", gap: 12, marginTop: 15 },
  saveBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 12,
    border: "none",
    background: "#e5e7eb",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
  },
  roomsBox: { display: "flex", flexDirection: "column", gap: 16 },
  roomCard: {
    display: "flex",
    gap: 16,
    padding: 16,
    border: "1px solid #eee",
    borderRadius: 12,
    background: "#fafafa",
    alignItems: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    transition: "all 0.3s",
  },
  roomTitle: { margin: 0, fontSize: 16, fontWeight: 600 },
  roomInfo: { margin: "4px 0", fontSize: 14, color: "#6b7280" },
  roomPrice: { fontSize: 14, fontWeight: 600, color: "#8a5cff" },
  historyBox: { display: "flex", flexDirection: "column", gap: 14 },
  historyItem: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    background: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  historyRoom: { fontSize: 15, fontWeight: 600, margin: 0 },
  historyDate: { fontSize: 14, color: "#6b7280", margin: 0 },
};
