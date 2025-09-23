import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiSearch,
  FiPlus,
  FiX,
  FiUpload,
  FiImage,
} from "react-icons/fi";
import { createRoom, getRooms, deleteRoom } from "../../services/roomService";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { FaCoins } from "react-icons/fa";
import { getMe } from "../../services/authService";
import "./RoomManagement.css";


// =================== MAIN COMPONENT ===================
export default function RoomManagement() {
  const [animate, setAnimate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [closing, setClosing] = useState(false);

  const [form, setForm] = useState({
  apartmentName: "",
  address: "",
  type: "phòng trọ",
  price: "",
  area: "",
  commission_percent: "",   // ✅ thêm
  status: "Còn trống",
  description: "",
  utilities: { electricity: "", water: "", internet: "", service: "" },
  commonAmenities: {
    camera: false, smartLock: false, fireAlarm: false,
    emergencyExit: false, washingArea: false, parking: false,
    laundryRoom: false, elevator: false, privateToilet: false,
    staircase: false, fireExtinguisher: false,
  },
});


  const [images, setImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // URL[]
  const [rooms, setRooms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [commissionPercent, setCommissionPercent] = useState(0);
  const [commissionValue, setCommissionValue] = useState(0);
  const [priceInWords, setPriceInWords] = useState("");

  // user hiện tại (từ token)
  const [currentUser, setCurrentUser] = useState(null);

  // Pagination + filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFilter] = useState("");

  const filteredRooms = rooms.filter((room) => {
    const matchName =
      room.apartmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter ? room.type === typeFilter : true;
    const matchPrice = priceFilter ? Number(room.price) <= Number(priceFilter) : true;
    return matchName && matchType && matchPrice;
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách phòng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Lấy user thật từ token
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe(); // { _id, name, phone, ... }
        setCurrentUser(me);
      } catch (e) {
        console.error("Không lấy được user:", e);
      }
    })();
  }, []);

  // Helpers
  const numberToVietnamese = (num) => {
    if (!num) return "";
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(".0", "") + " tỷ VND";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + " triệu VND";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + " nghìn VND";
    return num + " VND";
  };

  // Submit
 // Submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!currentUser?._id) {
    Swal.fire("Bạn chưa đăng nhập", "Vui lòng đăng nhập lại để tạo phòng.", "warning");
    return;
  }

  if (!form.apartmentName?.trim() || !form.address?.trim() || !form.price || !form.area) {
    Swal.fire("Thiếu thông tin", "Vui lòng nhập đủ tên căn hộ, địa chỉ, giá và diện tích.", "info");
    return;
  }

  try {
    setLoading(true);
    const cleanPrice = parseInt(form.price.toString().replace(/[.,\s]/g, ""), 10) || 0;

    const payload = {
      ...form,
      price: cleanPrice,
      utilities: {
        electricity: Number(form.utilities?.electricity || 0),
        water: Number(form.utilities?.water || 0),
        internet: Number(form.utilities?.internet || 0),
        service: Number(form.utilities?.service || 0),
      },
      commonAmenities: form.commonAmenities || {},
      // ✅ lưu thông tin user tạo phòng
      createdBy: {
        id: currentUser?._id || "",
        name: currentUser?.name || "",
        phone: currentUser?.phone || "",
      },
    };

    const newRoom = await createRoom(payload, images);

    // ✅ Đẩy phòng mới lên đầu danh sách thay vì cuối
    setRooms((prev) => [newRoom, ...prev]);

    Swal.fire({
      icon: "success",
      title: "Tạo phòng thành công!",
      timer: 1400,
      showConfirmButton: false,
    });

    handleClose();
  } catch (error) {
    console.error("❌ Lỗi khi tạo phòng:", error);
    Swal.fire("Lỗi", error?.response?.data?.error || "Không tạo được phòng", "error");
  } finally {
    setLoading(false);
  }
};


  // Upload ảnh
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Input thay đổi
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [group, field] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [group]: {
          ...prev[group],
          [field]: value,
        },
      }));
    } else {
      let newValue = value;
      if (name === "price") {
        const rawNumber = value.replace(/\D/g, "");
        const numberValue = rawNumber ? parseInt(rawNumber, 10) : 0;
        newValue = numberValue.toLocaleString("vi-VN");

        const percent = numberValue < 5000000 ? 10 : 5;
        const commission = (numberValue * percent) / 100;
        setCommissionPercent(percent);
        setCommissionValue(commission);
        setPriceInWords(numberToVietnamese(numberValue));
      }
      setForm((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  // Checkbox tiện ích chung
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target; // name dạng commonAmenities.x
    const [group, field] = name.split(".");
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: checked,
      },
    }));
  };

  // Close modal + animation
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setClosing(false);
    }, 300);
  };

  // ✅ Disable nút Lưu nếu chưa sẵn sàng
  const canSubmit =
    !!currentUser?._id &&
    !!form.apartmentName?.trim() &&
    !!form.address?.trim() &&
    !!form.price &&
    !!form.area &&
    !loading;

  return (
    <>
      <div
        style={{
          ...styles.page,
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease",
        }}
      >
        {/* Title */}
        <div style={styles.titleBox}>
          <FiHome style={styles.icon} />
          <h1 style={styles.title}>Room Management</h1>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm phòng..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            style={styles.filter}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tất cả loại phòng</option>
            <option value="phòng trọ">Phòng trọ</option>
            <option value="chung cư">Chung cư</option>
            <option value="nhà ở">Nhà ở</option>
            <option value="chung cư mini">Chung cư mini</option>
          </select>

          <button style={styles.addBtn} onClick={() => setShowModal(true)}>
            <FiPlus /> Thêm phòng
          </button>
        </div>

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Price / Month</th>
                <th style={styles.th}>Acreage</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map((room, i) => (
                <tr
                  key={room._id || i}
                  style={i % 2 === 0 ? styles.zebra : {}}
                  className="row-hover"
                  onClick={(e) => {
                    if (
                      e.target.tagName.toLowerCase() !== "button" &&
                      e.target.tagName.toLowerCase() !== "svg" &&
                      e.target.tagName.toLowerCase() !== "path"
                    ) {
                      navigate(`/admin/room/${room._id}`);
                    }
                  }}
                >
                  <td style={styles.td}>{indexOfFirst + i + 1}</td>

                  {/* Ảnh */}
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0].url}
                        alt="room"
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                        Không có ảnh
                      </span>
                    )}
                  </td>

                  <td style={styles.td}>{room.address}</td>
                  <td style={styles.td}>{room.type}</td>

                  <td style={styles.td}>
                    {room.price ? `${Number(room.price).toLocaleString()} VND` : "—"}
                    {room.commission_percent ? (
                      <span
                        className="commission-badge"
                        data-tooltip={`${(
                          (room.price * room.commission_percent) /
                          100
                        ).toLocaleString()} VND`}
                      >
                        {room.commission_percent}%
                      </span>
                    ) : null}
                  </td>

                  <td style={styles.td}>{room.area ? `${room.area} m²` : "—"}</td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.status,
                        ...(room.status === "Còn trống"
                          ? styles.available
                          : room.status === "Đã thuê"
                          ? styles.rented
                          : styles.maintenance),
                      }}
                    >
                      {room.status}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.editBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Sửa", room._id);
                        }}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const result = await Swal.fire({
                            title: "Bạn có chắc chắn?",
                            text: "Bạn có muốn xóa phòng này không",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#4f46e5",
                            cancelButtonColor: "#6b7280",
                            confirmButtonText: "Xóa",
                            cancelButtonText: "Hủy",
                          });
                          if (result.isConfirmed) {
                            try {
                              await deleteRoom(room._id);
                              setRooms((prev) => prev.filter((r) => r._id !== room._id));
                              Swal.fire({
                                icon: "success",
                                title: "Đã xóa!",
                                text: "Phòng đã được xóa thành công.",
                                timer: 2000,
                                showConfirmButton: false,
                              });
                            } catch (err) {
                              console.error("❌ Lỗi khi xóa:", err);
                              Swal.fire("Lỗi!", "Không thể xóa phòng này.", "error");
                            }
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
            «
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              className={currentPage === idx + 1 ? "active" : ""}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fancy-backdrop">
          <div className={`fancy-modal ${closing ? "animate-out" : "animate-in"}`}>
            {/* Header */}
            <div className="fancy-header">
              <div className="fancy-header-left">
                <FiImage size={24} className="icon" />
                <h2>Thêm phòng mới</h2>
              </div>
              <button className="close-btn" onClick={handleClose}>
                <FiX size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="fancy-body">
              <form onSubmit={handleSubmit} className="fancy-grid">
                {/* Left */}
               <div className="fancy-left">
  <label>Tên căn hộ</label>
  <input type="text" name="apartmentName" value={form.apartmentName} onChange={handleInputChange} required />

  <label>Địa chỉ</label>
  <input type="text" name="address" value={form.address} onChange={handleInputChange} required />

  <label>Loại phòng</label>
  <select name="type" value={form.type} onChange={handleInputChange}>
    <option>phòng trọ</option>
    <option>chung cư</option>
    <option>nhà ở</option>
    <option>chung cư mini</option>
  </select>

  <label>Giá (VND)</label>
  <input type="text" name="price" value={form.price} onChange={handleInputChange} required />

  {/* ✅ Thêm % hoa hồng */}
  <label>% Hoa hồng</label>
  <input
    type="number"
    name="commission_percent"
    min="0"
    max="100"
    value={form.commission_percent}
    onChange={handleInputChange}
    placeholder="Nhập phần trăm hoa hồng"
    required
  />

  <label>Diện tích (m²)</label>
  <input type="number" name="area" value={form.area} onChange={handleInputChange} required />

  <label>Trạng thái</label>
  <select name="status" value={form.status} onChange={handleInputChange}>
    <option>Còn trống</option>
    <option>Đã thuê</option>
    <option>Đang bảo trì</option>
  </select>

   <div className="extra-info">
                    <input
                      type="number"
                      name="floor"
                      value={form.floor || ""}
                      onChange={handleInputChange}
                      placeholder="Số tầng"
                    />
                    <input
                      type="number"
                      name="numberOfRooms"
                      value={form.numberOfRooms || ""}
                      onChange={handleInputChange}
                      placeholder="Số phòng"
                    />
                  </div>
</div>


                {/* Right */}
                <div className="fancy-right">
                  <label>Ảnh phòng</label>
                  <div className="upload-box">
                    <FiUpload size={28} />
                    <p>Kéo & thả hoặc chọn ảnh</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
                  </div>

                  {previews.length > 0 && (
                    <div className="preview-carousel">
                      <div className="preview-window">
                        <div
                          className="preview-track"
                          style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
                        >
                          {previews.map((src, idx) => (
                            <div key={idx} className="preview-item">
                              <img src={src} alt={`preview-${idx}`} />
                              <button
                                type="button"
                                className="remove-btn"
                                onClick={() => {
                                  setPreviews((prev) => prev.filter((_, i) => i !== idx));
                                  setImages((prev) => prev.filter((_, i) => i !== idx));
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="carousel-dots">
                        {Array.from({ length: Math.max(previews.length - 2, 1) }).map((_, idx) => (
                          <span
                            key={idx}
                            className={`dot ${currentIndex === idx ? "active" : ""}`}
                            onClick={() => setCurrentIndex(idx)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                 
                  {/* Extra info */}
                 

                  <label>Tiện ích (giá trị nhập vào)</label>
                  <div className="amenities-inputs">
                    <input
                      type="number"
                      name="utilities.electricity"
                      value={form.utilities.electricity}
                      onChange={handleInputChange}
                      placeholder="Điện (đ/kWh)"
                    />
                    <input
                      type="number"
                      name="utilities.water"
                      value={form.utilities.water}
                      onChange={handleInputChange}
                      placeholder="Nước (đ/m³)"
                    />
                    <input
                      type="number"
                      name="utilities.internet"
                      value={form.utilities.internet}
                      onChange={handleInputChange}
                      placeholder="Internet (đ/tháng)"
                    />
                    <input
                      type="number"
                      name="utilities.service"
                      value={form.utilities.service}
                      onChange={handleInputChange}
                      placeholder="Dịch vụ khác (đ)"
                    />
                  </div>

                  <label>Tiện ích chung</label>
                  <div className="amenities-grid">
                    {[
                      { key: "camera", label: "Camera giám sát" },
                      { key: "smartLock", label: "Khóa thông minh" },
                      { key: "fireAlarm", label: "Báo cháy" },
                      { key: "privateToilet", label: "Vệ sinh khép kín" },
                      { key: "washingArea", label: "Khu giặt phơi" },
                      { key: "parking", label: "Bãi đỗ xe" },
                      { key: "staircase", label: "Thang bộ thoát hiểm" },
                      { key: "elevator", label: "Thang máy" },
                      { key: "fireExtinguisher", label: "Bình chữa cháy" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`amenity-card ${form.commonAmenities[item.key] ? "checked" : ""}`}
                      >
                        <input
                          type="checkbox"
                          name={`commonAmenities.${item.key}`}
                          checked={!!form.commonAmenities[item.key]}
                          onChange={handleCheckboxChange}
                        />
                        <span>{item.label}</span>
                      </label>
                      
                    ))}
                  </div>
                   <label>Mô tả</label>
                      <textarea
                        rows="5"
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        placeholder="Mô tả chi tiết phòng..."
                      />

                </div>

                {loading && (
                  <div className="loading-overlay">
                    <div className="loading-box">
                      <div className="spinner"></div>
                      <p>Phòng của bạn đang được cập nhật mới, vui lòng đợi 1 chút ạ!</p>
                    </div>
                  </div>
                )}

                {/* Footer: user info + actions */}
                <div className="fancy-footer">
                  <div className="user-chip">
                    <div className="avatar">
                      {(currentUser?.name || "N").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="meta">
                      <div className="name">{currentUser?.name || "Nguyễn Văn A"}</div>
                      <div className="phone">{currentUser?.phone || "Chưa cập nhật số điện thoại"}</div>
                    </div>
                  </div>

                  <div className="footer-actions">
                    <button type="button" className="cancel" onClick={handleClose}>
                      Hủy
                    </button>
                    <button type="submit" className="submit" disabled={!canSubmit}>
                      {loading ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =================== STYLES ===================
const styles = {
  page: {
    padding: "40px",
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    background: "#f9fafb",
  },
  titleBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
    padding: "20px",
    background: "linear-gradient(135deg, #eef2ff, #fafafa)",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  icon: { fontSize: "26px", color: "#7c3aed" },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "white",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    flex: 1,
    minWidth: "220px",
  },
  searchIcon: { color: "#9ca3af", marginRight: "8px" },
  searchInput: { border: "none", outline: "none", fontSize: "14px", flex: 1 },
  filter: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(99,102,241,0.4)",
    transition: "0.2s",
  },
  tableWrapper: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  zebra: { background: "#fafafa" },
  th: {
    padding: "16px 20px",
    background: "linear-gradient(90deg,#f3f4f6,#f9fafb)",
    fontWeight: "700",
    fontSize: "13px",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
  },
  td: {
    padding: "16px 20px",
    fontSize: "14px",
    borderBottom: "1px solid #f1f5f9",
  },
  status: {
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  available: { background: "#dcfce7", color: "#15803d" },
  rented: { background: "#fee2e2", color: "#b91c1c" },
  maintenance: { background: "#fef9c3", color: "#a16207" },
  actions: { display: "flex", gap: "10px" },
  editBtn: {
    background: "#eef2ff",
    border: "none",
    padding: "8px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#4f46e5",
  },
  deleteBtn: {
    background: "#fee2e2",
    border: "none",
    padding: "8px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#dc2626",
  },
  
};

// =================== CSS INJECT ===================
const styleTag = document.createElement("style");
styleTag.innerHTML = `
/* Backdrop mờ + blur */
.fancy-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 60px; z-index: 999;
  animation: fadeIn 0.3s ease forwards;
}

/* Badge hoa hồng */
.commission-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
}
.commission-badge:hover { transform: scale(1.1); box-shadow: 0 4px 10px rgba(99,102,241,0.4); }
.commission-badge::after {
  content: attr(data-tooltip);
  position: absolute; bottom: 125%; left: 50%;
  transform: translateX(-50%);
  background: #111827; color: #fff; padding: 6px 10px; border-radius: 6px;
  font-size: 12px; font-weight: 500; white-space: nowrap; opacity: 0; pointer-events: none;
  transition: opacity .3s, transform .3s;
}
.commission-badge:hover::after { opacity: 1; transform: translateX(-50%) translateY(-4px); }

/* Modal */
.fancy-modal {
  width: min(1040px, 92vw); max-height: 86vh;
  background: #fff; border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
  display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid #e5e7eb;
}
.animate-in { animation: scaleIn .4s ease forwards; }
.animate-out { animation: scaleOut .3s ease forwards; }

.fancy-header {
  padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(90deg,#6d74ff,#8b5cf6); color: #fff;
}
.fancy-header-left { display: flex; gap: 10px; align-items: center; }
.fancy-header h2 { margin: 0; font-size: 20px; font-weight: 700; }
.close-btn { background: transparent; border: none; cursor: pointer; color: white; font-size: 22px; }

.fancy-body { flex: 1; overflow-y: auto; padding: 20px; }
.fancy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.fancy-left, .fancy-right { display: flex; flex-direction: column; gap: 16px; }

/* Label & input */
label { font-size: 14px; font-weight: 600; color: #374151; }
input, select, textarea {
  padding: 12px 14px; border: 1px solid #ddd; border-radius: 12px; font-size: 15px; outline: none;
  transition: .2s; background: #fafafa; box-shadow: inset 0 1px 2px rgba(0,0,0,.05);
}
input:focus, select:focus, textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.15); background: #fff; }
textarea { resize: none; min-height: 80px; }

/* Upload box */
.upload-box {
  border: 2px dashed #cbd5e1; border-radius: 14px; padding: 24px;
  text-align: center; color: #6b7280; position: relative; cursor: pointer; transition: .3s; background: #fafafa; font-size: 14px;
}
.upload-box:hover { border-color: #6366f1; background: #eef2ff; transform: scale(1.02); }
.upload-box input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

/* Carousel preview */
.preview-carousel { position: relative; margin-top: 14px; display: flex; flex-direction: column; align-items: center; width: 100%; overflow: hidden; }
.preview-window { overflow: hidden; width: 100%; }
.preview-track { display: flex; transition: transform .5s ease; }
.preview-item { flex: 0 0 calc(100% / 3); padding: 0 6px; position: relative; }
.preview-item img { width: 100%; height: 110px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.12); transition: transform .3s ease; }
.preview-item img:hover { transform: scale(1.05); }
/* Nút xóa ảnh */
.remove-btn {
  position: absolute; top: 3px; right: 8px; background: rgba(0,0,0,.5); color: #fff;
  border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer; opacity: .85; transition: all .2s;
}
.remove-btn:hover { background: rgba(220,38,38,.9); opacity: 1; }
/* Dots */
.carousel-dots { display: flex; justify-content: center; margin-top: 12px; gap: 10px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #d1d5db; cursor: pointer; transition: all .3s; }
.dot.active { background: #7c3aed; transform: scale(1.3); }

/* Amenities */
.amenities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 10px; }
.amenity-card {
  display: flex; justify-content: center; align-items: center; padding: 10px 12px; height: 30px;
  border-radius: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-size: 14px; font-weight: 500; color: #374151;
  cursor: pointer; transition: all .25s; text-align: center; white-space: nowrap;
}
.amenity-card:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 6px 18px rgba(99,102,241,.25); border-color: #a78bfa; }
.amenity-card input { display: none; }
.amenity-card.checked { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; box-shadow: 0 6px 16px rgba(124,58,237,.4); animation: pulseIn .4s ease; }

/* Inputs tiện ích giá trị */
.amenities-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.amenities-inputs input { padding: 12px 14px; border: 1px solid #ddd; border-radius: 12px; font-size: 14px; background: #fafafa; transition: .2s; }
.amenities-inputs input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.15); background: #fff; }

/* Extra info */
.extra-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; animation: fadeInUp .6s ease; }
.extra-info input { padding: 12px 14px; border: 1px solid #ddd; border-radius: 12px; font-size: 14px; background: #fafafa; transition: .3s; }
.extra-info input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.15); background: #fff; }

/* Loading overlay */
.loading-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.loading-box { background: #fff; padding: 24px 32px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.3); text-align: center; animation: fadeIn .3s ease; }
.spinner { border: 4px solid #e5e7eb; border-top: 4px solid #7c3aed; border-radius: 50%; width: 36px; height: 36px; margin: 0 auto; animation: spin 1s linear infinite; }
.loading-box p { margin-top: 12px; font-size: 15px; font-weight: 500; color: #374151; }

/* Footer: user info + actions */
.fancy-footer{
  grid-column: span 2;
  display:flex; align-items:center; justify-content:space-between;
  gap:16px; margin-top:18px; padding-top:14px;
  border-top:1px solid #f3f4f6;
}
.user-chip{
  display:flex; align-items:center; gap:12px;
  background: rgba(99,102,241,.06);
  border:1px solid rgba(99,102,241,.15);
  padding:10px 12px; border-radius:12px;
}
.user-chip .avatar{
  width:36px; height:36px; border-radius:50%;
  display:grid; place-items:center; font-weight:800; color:#0f172a;
  background:linear-gradient(135deg,#93B0FF,#A98BFF,#6FE3FF);
  box-shadow:0 6px 16px rgba(147,176,255,.35);
}
.user-chip .meta .name{ font-weight:700; color:#111827; line-height:1.1; }
.user-chip .meta .phone{ font-size:12px; color:#6b7280; }

.footer-actions{ display:flex; align-items:center; gap:12px; }
.footer-actions .cancel{
  background:#f3f4f6; border:none; padding:10px 20px; border-radius:12px; cursor:pointer;
  font-weight:600; color:#374151; transition:.2s;
}
.footer-actions .cancel:hover{ background:#e5e7eb; }
.footer-actions .submit{
  background: linear-gradient(90deg,#6366f1,#8b5cf6); color:#fff; border:none; padding:10px 26px; border-radius:12px;
  font-weight:700; cursor:pointer; box-shadow:0 6px 16px rgba(99,102,241,.38); transition: transform .18s, filter .18s;
}
.footer-actions .submit:hover{ transform: translateY(-2px); filter: saturate(1.05); }
.footer-actions .submit:disabled{
  opacity:.6; cursor:not-allowed; filter:grayscale(.2); transform:none; box-shadow:none;
}

/* Commission box */
.commission-box{
  margin-top: 6px; padding: 10px 14px; border-radius: 12px;
  background: linear-gradient(135deg,#f5f3ff,#faf5ff); border:1px solid #ddd6fe;
  color:#4c1d95; font-size:14px; font-weight:500; animation: fadeInUp .5s ease; box-shadow: 0 4px 12px rgba(99,102,241,.12);
}
.commission-box p{ margin: 2px 0; }
.commission-box .commission-money{ font-size: 16px; font-weight: 700; color:#6d28d9; }
.commission-words{ margin-top:4px; font-size:13px; font-style:italic; color:#6b7280; animation: fadeInUp .4s ease; }

/* Pagination */
.pagination{ margin:20px 0; display:flex; justify-content:center; gap:8px; }
.pagination button{
  padding:8px 14px; border:1px solid #7c3aed; border-radius:8px; background:#fff; color:#7c3aed;
  font-weight:600; cursor:pointer; transition: all .25s;
}
.pagination button:hover{ background:#f3e8ff; }
.pagination button.active{ background:#7c3aed; color:#fff; }
.pagination button:disabled{ opacity:.5; cursor:not-allowed; }

/* Animations */
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes scaleIn { from{opacity:0; transform:scale(.9)} to{opacity:1; transform:scale(1)} }
@keyframes scaleOut { from{opacity:1; transform:scale(1)} to{opacity:0; transform:scale(.9)} }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulseIn { 0%{ transform:scale(.9); opacity:.6 } 100%{ transform:scale(1); opacity:1 } }
`;


document.head.appendChild(styleTag);
