import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserShield,
  FaCamera,
  FaSignOutAlt,
  FaHome,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import Swal from "sweetalert2";

// Services
import { getMe, updateUser } from "../../services/authService";
import { getCommissions } from "../../services/commissionService";

export default function AdministratorProfile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [commissions, setCommissions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(commissions.length / itemsPerPage);

  // Animation variants
  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // ✅ Fetch user info
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
  // ✅ Fetch commissions
useEffect(() => {
  const fetchCommissions = async () => {
    try {
      if (!user) return;

      // Nếu là boss → gọi getCommissions để lấy tất cả
      // Nếu không → cũng gọi getCommissions, nhưng backend đã lọc theo token.user_id
      const res = await getCommissions({ page: 1, pageSize: 100 });
      const data = res.data || res;
      const list = data.data || data;

      // 🔑 Nếu user.role !== "boss" thì backend chỉ trả về commission của user đó
      // nhưng ta vẫn log ra console để debug
      console.log("📊 Dữ liệu commissions cho role:", user.role, list);

      setCommissions(list);

      // Tính tổng doanh thu (tổng số tiền hoa hồng mà user này nhận được)
      const total = list.reduce((sum, c) => sum + (c.amount || 0), 0);
      setTotalRevenue(total);

      console.log(
        `💰 Tổng doanh thu của role [${user.role}] = ${total.toLocaleString(
          "vi-VN"
        )} VND`
      );
    } catch (err) {
      console.error("❌ Lỗi fetch commissions:", err);
    }
  };

  if (activeTab === "revenue") fetchCommissions();
}, [activeTab, user]);


  // ✅ Handle input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save user info
  const handleSave = async () => {
    try {
      const updated = await updateUser(formData);
      setUser(updated);
      setFormData(updated);
      setEditMode(false);
      Swal.fire("Thành công", "Cập nhật thông tin thành công!", "success");
    } catch (err) {
      console.log("❌ Lỗi update user:", err);
      Swal.fire("Lỗi", "Không thể cập nhật thông tin", "error");
    }
  };

  // ✅ Upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result })); // base64
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn sẽ cần đăng nhập lại để sử dụng.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      Swal.fire("Đã đăng xuất!", "", "success").then(() => {
        window.location.replace("/login");
      });
    }
  };

  // ✅ Skeleton loader
  if (!user) {
    return (
      <div style={styles.page}>
        <motion.div
          style={styles.card}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div style={styles.left}>
            <div
              style={{
                ...styles.avatarBox,
                background: "#e5e7eb",
                borderRadius: "50%",
              }}
            ></div>
            <div
              style={{
                width: 120,
                height: 20,
                background: "#e5e7eb",
                borderRadius: 8,
                marginTop: 20,
              }}
            ></div>
            <div
              style={{
                width: 160,
                height: 16,
                background: "#e5e7eb",
                borderRadius: 8,
                marginTop: 10,
              }}
            ></div>
          </div>
          <div style={styles.right}>
            <div
              style={{
                width: "100%",
                height: 200,
                background: "#f3f4f6",
                borderRadius: 12,
              }}
            ></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
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
              <FaSignOutAlt style={{ marginRight: 8 }} /> Đăng xuất
            </button>
          </div>
        </motion.div>

        {/* Right */}
        <div style={styles.right}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {["info", "schedules", "revenue"].map((tab) => (
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
                  : tab === "schedules"
                  ? "Lịch hẹn xem nhà"
                  : "Doanh thu"}
              </button>
            ))}
          </div>

          {/* Nội dung tab */}
          <AnimatePresence mode="wait">
            {/* Info */}
            {activeTab === "info" && (
              <motion.div
                key="info"
                style={styles.infoBox}
                variants={fadeVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {editMode ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Họ tên"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Số điện thoại"
                    />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
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
                      {user.phone || "Chưa có"}
                    </p>
                    <p style={styles.item}>
                      <FaMapMarkerAlt style={styles.iconInline} />{" "}
                      {user.address || "Chưa cập nhật"}
                    </p>
                    <p style={styles.item}>
                      <FaCalendarAlt style={styles.iconInline} /> Ngày tham gia:{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "Không rõ"}
                    </p>
                    <p style={styles.item}>
                      <FaUserShield style={styles.iconInline} /> Vai trò:{" "}
                      {user.role}
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

            {/* Schedules */}
            {activeTab === "schedules" && (
              <motion.div
                key="schedules"
                style={styles.historyBox}
                variants={fadeVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  style={styles.historyItem}
                  whileHover={{ scale: 1.02 }}
                >
                  <FaHome style={{ color: "#8a5cff" }} />
                  <div>
                    <p style={styles.historyRoom}>Căn hộ Sunrise Riverside</p>
                    <p style={styles.historyDate}>
                      <FaClock style={styles.iconInline} /> 20/09/2025 - 14:00 -{" "}
                      <span style={{ fontWeight: 600 }}>Đang xử lý</span>
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  style={styles.historyItem}
                  whileHover={{ scale: 1.02 }}
                >
                  <FaHome style={{ color: "#8a5cff" }} />
                  <div>
                    <p style={styles.historyRoom}>Chung cư Eco Green</p>
                    <p style={styles.historyDate}>
                      <FaClock style={styles.iconInline} /> 22/09/2025 - 09:00 -{" "}
                      <span style={{ fontWeight: 600 }}>Hoàn thành</span>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Revenue */}
            {activeTab === "revenue" && (
              <motion.div
                key="revenue"
                style={styles.revenueBox}
                variants={fadeVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Tổng doanh thu */}
                <motion.div
                  style={styles.revenueHeader}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaMoneyBillWave
                    style={{ fontSize: 20, color: "#6366f1", marginRight: 8 }}
                  />
                  <span
                    style={{ fontWeight: 600, fontSize: 16, color: "#374151" }}
                  >
                    Tổng:{" "}
                    <span style={{ color: "#16a34a" }}>
                      {totalRevenue.toLocaleString("vi-VN")} VND
                    </span>{" "}
                    ({commissions.length} giao dịch)
                  </span>
                </motion.div>

                {/* Danh sách commission */}
                <div style={styles.commissionList}>
                  {commissions
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((c, idx) => (
                      <motion.div
                        key={idx}
                        style={styles.commissionCard}
                        whileHover={{ scale: 1.03 }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, type: "spring" }}
                      >
                        <h4 style={styles.cardTitle}>
                          {c.room_id?.apartmentName || c.room_id}
                        </h4>

                        <p style={styles.cardText}>
                          Giá phòng:{" "}
                          <span style={{ fontWeight: 600 }}>
                            {c.room_price.toLocaleString("vi-VN")} VND
                          </span>
                        </p>
                          <p style={styles.cardText}>
                          Doanh thu sau hoa hồng:{" "}
                          <span
                            style={{ fontWeight: 600, color: "#8b5cf6" }}
                          >
                            {(c.room_price - c.amount).toLocaleString("vi-VN")}{" "}
                            VND
                          </span>
                        </p>



                        <p style={styles.cardText}>
                          Hoa hồng:{" "}
                          <span
                            style={{ fontWeight: 600, color: "#16a34a" }}
                          >
                            {c.commission_percent}% ={" "}
                            {c.amount.toLocaleString("vi-VN")} VND
                          </span>
                        </p>

                      
                        <p style={styles.dateText}>
                          Ngày:{" "}
                          {new Date(c.createdAt || c.create_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </motion.div>
                    ))}
                </div>

                {/* Pagination */}
                <div style={styles.pagination}>
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={styles.pageBtn}
                  >
                    «
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    style={styles.pageBtn}
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        ...styles.pageBtn,
                        ...(currentPage === i + 1 ? styles.pageActive : {}),
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    style={styles.pageBtn}
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    style={styles.pageBtn}
                  >
                    »
                  </button>
                </div>

                <p style={styles.paginationInfo}>
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, commissions.length)} /{" "}
                  {commissions.length} mục
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa, #e4e9f7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    display: "flex",
    background: "#fff",
    borderRadius: 25,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    maxWidth: 1100,
    width: "100%",
    padding: "60px 40px",
    gap: 40,
    alignItems: "stretch",
    transition: "all 0.3s ease",
  },
  left: {
    flexBasis: "30%",
    textAlign: "center",
    borderRight: "1px solid #eee",
    paddingRight: 30,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBox: {
    position: "relative",
    width: 160,
    height: 160,
    margin: "0 auto",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #8a5cff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    transition: "transform 0.3s ease",
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
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
  },
  name: { fontSize: 22, fontWeight: 700, marginTop: 15, marginBottom: 5 },
  email: { fontSize: 14, color: "#6b7280" },
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
    transition: "all 0.3s ease",
  },
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
    transition: "all 0.3s ease",
  },
  tabActive: {
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    border: "1px solid #8a5cff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  infoBox: { display: "flex", flexDirection: "column", gap: 12, flex: 1 },
  item: { fontSize: 15, color: "#374151", display: "flex", gap: 8 },
  iconInline: { color: "#8a5cff", marginRight: 6 },
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
    transition: "all 0.3s ease",
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
  historyBox: { display: "flex", flexDirection: "column", gap: 14 },
  historyItem: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    background: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  },
  historyRoom: { fontSize: 15, fontWeight: 600, margin: 0 },
  historyDate: { fontSize: 14, color: "#6b7280", margin: 0 },
  revenueBox: {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "10px 0 20px",
  gap: 20,
},

revenueHeader: {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  marginBottom: 10,
  paddingRight: 10,
},

commissionList: {
  display: "flex",
  flexDirection: "column",
  gap: 18,
  width: "100%",
},

commissionCard: {
  background: "#fff",
  padding: "20px 22px",
  borderRadius: 18,
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
},

cardTitle: {
  margin: "0 0 6px 0",
  fontSize: 17,
  fontWeight: 700,
  color: "#111827",
},

cardText: {
  fontSize: 14,
  color: "#374151",
  margin: "4px 0",
},

dateText: {
  fontSize: 13,
  color: "#9ca3af",
  marginTop: 6,
},

pagination: {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  marginTop: 20,
},

pageBtn: {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #8b5cf6",
  background: "#fff",
  color: "#8b5cf6",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.3s ease",
},

pageActive: {
  background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
  color: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
},

paginationInfo: {
  textAlign: "center",
  fontSize: 13,
  color: "#6b7280",
  marginTop: 8,
},


};
