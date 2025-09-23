import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomById } from "../../services/roomService";
import {
  FaMapMarkerAlt,
  FaRulerCombined,
  FaBuilding,
  FaDoorOpen,
  FaArrowLeft,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faLock,
  faFireExtinguisher,
  faBell,
  faStairs,
  faToilet,
  faSquareParking,
  faShirt,
  faBuilding as faElevator,
} from "@fortawesome/free-solid-svg-icons";

export default function DetailRoomManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getRoomById(id);
        setRoom(data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy chi tiết phòng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) return <p style={{ padding: "40px" }}>⏳ Đang tải dữ liệu...</p>;
  if (!room) return <p style={{ padding: "40px" }}>❌ Không tìm thấy phòng</p>;

  return (
    <>
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Back */}
          <button style={styles.backBtn} onClick={() => navigate("/admin/room")}>
            <FaArrowLeft /> Quay lại
          </button>

          <div style={styles.grid}>
            {/* Left: Hình ảnh */}
            <div style={styles.left}>
              <img
                src={room.images?.[currentImg]?.url}
                alt="main"
                style={styles.mainImage}
              />
              <div style={styles.gallery}>
                {room.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`thumb-${idx}`}
                    style={{
                      ...styles.thumb,
                      border:
                        currentImg === idx
                          ? "2px solid #6366f1"
                          : "2px solid transparent",
                    }}
                    onClick={() => setCurrentImg(idx)}
                  />
                ))}
              </div>

              {/* Tiện ích chung */}
              <div style={styles.amenitiesSection}>
                <h3 style={styles.sectionTitle}>Tiện ích chung</h3>
                <div style={styles.amenitiesGrid}>
                  {[
                    { key: "camera", icon: faVideo, label: "Camera an ninh" },
                    { key: "smartLock", icon: faLock, label: "Khóa thông minh" },
                    { key: "fireAlarm", icon: faBell, label: "Báo cháy" },
                    { key: "fireExtinguisher", icon: faFireExtinguisher, label: "Bình chữa cháy" },
                    { key: "privateToilet", icon: faToilet, label: "Vệ sinh khép kín" },
                    { key: "washingArea", icon: faShirt, label: "Khu giặt phơi" },
                    { key: "parking", icon: faSquareParking, label: "Bãi đỗ xe" },
                    { key: "staircase", icon: faStairs, label: "Thang bộ" },
                    { key: "elevator", icon: faElevator, label: "Thang máy" },
                  ].map(
                    (amenity, idx) =>
                      room.commonAmenities?.[amenity.key] && (
                        <div key={idx} style={styles.amenityItem}>
                          <div style={styles.amenityIcon}>
                            <FontAwesomeIcon icon={amenity.icon} />
                          </div>
                          <div style={styles.amenityText}>{amenity.label}</div>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>

            {/* Right: Thông tin */}
            <div style={styles.right}>
              <h1 style={styles.title}>{room.description || "Phòng cho thuê"}</h1>
              <p style={styles.location}>
                <FaMapMarkerAlt /> {room.address}
              </p>
              <p style={styles.price}>
                {room.price.toLocaleString()} VND / tháng
              </p>
              <div style={styles.details}>
                <span>
                  Loại phòng: <b>{room.type}</b>
                </span>
                <span>
                  Diện tích: <b>{room.area} m²</b>
                </span>
                <span>
                  Số tầng: <b>{room.floor}</b>
                </span>
                <span>
                  Số phòng: <b>{room.numberOfRooms}</b>
                </span>
                <span>
                  Chủ sở hữu: <b>{room.create_by?.name || "Không rõ"}</b>
                </span>
                <span>
                  Hoa hồng: <b>{room.commission_percent}%</b>
                </span>
              </div>

              <p style={styles.desc}>
                {room.description ||
                  "Phòng được thiết kế hiện đại, sang trọng và đầy đủ tiện nghi."}
              </p>

              {/* Phí dịch vụ */}
              <div style={styles.servicesSection}>
                <h3 style={styles.sectionTitle}>Phí dịch vụ chung</h3>
                <div style={styles.servicesGrid}>
                  <div style={styles.serviceItem}>
                    <div>Tiền điện</div>
                    <div style={styles.serviceValue}>
                      {room.utilities?.electricity} đ/kWh
                    </div>
                  </div>
                  <div style={styles.serviceItem}>
                    <div>Tiền nước</div>
                    <div style={styles.serviceValue}>
                      {room.utilities?.water} đ/m³
                    </div>
                  </div>
                  <div style={styles.serviceItem}>
                    <div>Internet</div>
                    <div style={styles.serviceValue}>
                      {room.utilities?.internet} đ/tháng
                    </div>
                  </div>
                  <div style={styles.serviceItem}>
                    <div>Dịch vụ khác</div>
                    <div style={styles.serviceValue}>
                      {room.utilities?.service} đ
                    </div>
                  </div>
                </div>
              </div>

              {/* Trạng thái */}
              <div style={{ marginTop: "20px" }}>
                <span style={styles.status(room.status)}>{room.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    background: "#f9fafb",
    minHeight: "100vh",
    padding: "30px",
    fontFamily: "'Poppins', sans-serif",
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "#eef2ff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#4f46e5",
    fontWeight: "600",
    marginBottom: "20px",
  },
  grid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "40px" },
  left: { display: "flex", flexDirection: "column", gap: "20px" },
  mainImage: {
    width: "100%",
    height: "450px",
    objectFit: "cover",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  thumb: {
    width: "100%",
    height: "100px",
    objectFit: "cover",
    borderRadius: "12px",
    cursor: "pointer",
  },
  right: {
    background: "#fff",
    padding: "35px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  title: { fontSize: "26px", fontWeight: "700", color: "#1f2937" },
  location: { fontSize: "15px", color: "#6b7280", display: "flex", gap: "6px" },
  price: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#7c3aed",
    margin: "10px 0",
  },
  details: {
    display: "flex",
    gap: "20px",
    fontSize: "15px",
    color: "#374151",
    flexWrap: "wrap",
  },
  desc: { fontSize: "15px", lineHeight: 1.6, color: "#4b5563" },
  servicesSection: {
    marginTop: "20px",
    padding: "20px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "15px",
  },
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  serviceItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  serviceValue: { color: "#7c3aed", fontWeight: "600" },
  amenitiesSection: {
    marginTop: "20px",
    padding: "25px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
  },
  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "15px",
  },
  amenityItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#f9fafb",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  amenityIcon: { fontSize: "20px", color: "#7c3aed" },
  amenityText: { fontSize: "15px", color: "#333", fontWeight: "500" },
  status: (stt) => ({
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "999px",
    fontWeight: "600",
    fontSize: "13px",
    background:
      stt === "Còn trống"
        ? "#dcfce7"
        : stt === "Đã thuê"
        ? "#fee2e2"
        : "#fef9c3",
    color:
      stt === "Còn trống"
        ? "#15803d"
        : stt === "Đã thuê"
        ? "#b91c1c"
        : "#a16207",
  }),
};
