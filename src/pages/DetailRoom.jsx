import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

import { createSchedule, getMySchedules } from "../services/scheduleService";
import { getRoomById } from "../services/roomService";
import { getMe } from "../services/authService";
import RelatedRooms from "../components/RelatedRooms";

import {
  addFavourite,
  removeFavourite,
  getFavouritesByUser,
} from "../services/favouriteService";

import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaTimes,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaHeart,
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
  faBuilding,
  faPhone as faPhoneSolid,
} from "@fortawesome/free-solid-svg-icons";

/* =================== MAIN COMPONENT =================== */
export default function DetailRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [currentImg, setCurrentImg] = useState(0);
  const [thumbStart, setThumbStart] = useState(0); // điểm bắt đầu của "cửa sổ" 4 thumbnail
  const [direction, setDirection] = useState(0); // hướng chuyển ảnh (-1 trái, +1 phải)

  const [favourites, setFavourites] = useState({});
  const [user, setUser] = useState(null);
  const [hasBooked, setHasBooked] = useState(false);

  const [animatePage, setAnimatePage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // form
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
    date: null,
    time: "",
  });

  // ===== Yêu thích
  const toggleFavourite = async (roomId) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để thêm phòng vào yêu thích.",
        confirmButtonText: "Đăng nhập",
        confirmButtonColor: "#7c3aed",
      }).then((r) => r.isConfirmed && navigate("/login"));
      return;
    }

    try {
      if (favourites[roomId]) {
        await removeFavourite(favourites[roomId]);
        setFavourites((prev) => {
          const m = { ...prev };
          delete m[roomId];
          return m;
        });
      } else {
        const res = await addFavourite(roomId);
        setFavourites((prev) => ({ ...prev, [roomId]: res._id }));
      }
    } catch (err) {
      console.error("❌ toggle favourite:", err);
      Swal.fire("Lỗi", "Không thể xử lý yêu thích", "error");
    }
  };

  // Lấy fav của user
  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const u = await getMe();
        setUser(u);
        if (u) {
          const favs = await getFavouritesByUser(u._id);
          const map = {};
          favs.forEach((f) => (map[f.room_id._id] = f._id));
          setFavourites(map);
        }
      } catch {
        /* not logged in */
      }
    };
    fetchFavs();
  }, [id]);

  // Scroll top + page animation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAnimatePage(false);
    const t = setTimeout(() => setAnimatePage(true), 200);
    return () => clearTimeout(t);
  }, [id]);

  // Lấy room
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const data = await getRoomById(id);
        setRoom(data);
        setCurrentImg(0);
        setThumbStart(0);
      } catch (e) {
        console.error("❌ fetch room:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  // Check đăng nhập
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const u = await getMe();
        if (u) {
          setIsLoggedIn(true);
          setForm((p) => ({
            ...p,
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            address: u.address || "",
          }));
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Check lịch
  useEffect(() => {
    const checkMyBooking = async () => {
      try {
        if (!isLoggedIn) return;
        const my = await getMySchedules();
        const booked = my?.find((sch) => {
          const rid = sch.room_id?._id || sch.room_id;
          return String(rid) === String(id);
        });
        setHasBooked(Boolean(booked && ["pending", "assigned", "accepted"].includes(booked.status)));
      } catch (e) {
        console.error("❌ check schedule:", e);
        setHasBooked(false);
      }
    };
    checkMyBooking();
  }, [id, isLoggedIn]);

  // ===== Form
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!isLoggedIn) {
    Swal.fire({
      icon: "warning",
      title: "Vui lòng đăng nhập!",
      text: "Bạn cần đăng nhập để tiếp tục.",
      confirmButtonText: "Đến đăng nhập",
      confirmButtonColor: "#7c3aed",
    }).then((r) => r.isConfirmed && navigate("/login"));
    return;
  }

  try {
    const u = await getMe();

    let start_time = null;
    let end_time = null;

    if (form.date && form.time) {
      const [h, m] = form.time.split(":");
      const d = new Date(form.date);
      d.setHours(h, m);
      start_time = d.toISOString();

      // ✅ Tự động cộng 1h30p
      const end = new Date(d.getTime() + 90 * 60000);
      end_time = end.toISOString();
    }

    await createSchedule({
      room_id: id,
      customer_name: form.name,
      customer_email: form.email,   // 👈 thêm email
      customer_phone: form.phone,
      start_time,
      end_time,
      note: form.note,
      create_by: u?._id,
    });

    Swal.fire({
      icon: "success",
      title: "Đặt lịch thành công!",
      text: "Bạn đã đặt lịch xem phòng thành công.",
      confirmButtonText: "OK",
      confirmButtonColor: "#7c3aed",
    });
    setHasBooked(true);
    setShowModal(false);
  } catch (err) {
    Swal.fire("Lỗi", err?.error || "Không thể đặt lịch, vui lòng thử lại", "error");
  }
};

  const togglePhoneVisibility = () => {
    if (!isLoggedIn) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng đăng nhập!",
        text: "Đăng nhập để xem số điện thoại.",
        confirmButtonText: "Đến đăng nhập",
        confirmButtonColor: "#7c3aed",
      }).then((r) => r.isConfirmed && navigate("/login"));
    } else {
      setIsPhoneVisible((v) => !v);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>⏳ Đang tải dữ liệu...</p>;
  if (!room) return <p style={{ padding: 40 }}>❌ Không tìm thấy phòng.</p>;

  // % hoa hồng hiển thị cạnh tên
  const commission =
    typeof room.commission_percent === "number"
      ? room.commission_percent
      : room.price < 5_000_000
      ? 10
      : 5;

  /* ====== Animation slide ảnh ====== */
  const imageVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 220 : -220,
      opacity: 0,
      scale: 0.985,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.55, ease: "easeOut" },
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir > 0 ? -220 : 220,
      opacity: 0,
      scale: 0.985,
      transition: { duration: 0.45, ease: "easeIn" },
    }),
  };

  // helper
  const total = room?.images?.length || 0;

  // ===== Ảnh lớn: chuyển ảnh + đồng bộ cửa sổ thumbnail để hiện ảnh đang chọn
  const changeImage = (newIndex) => {
    if (!total) return;

    let idx = newIndex;
    if (idx < 0) {
      setDirection(-1);
      idx = total - 1;
    } else if (idx >= total) {
      setDirection(1);
      idx = 0;
    } else {
      setDirection(idx > currentImg ? 1 : -1);
    }
    setCurrentImg(idx);

    if (total > 4) {
      // nếu ảnh đang chọn không nằm trong cửa sổ 4 ảnh -> đưa nó thành ảnh đầu cửa sổ
      const inWindow = (k) =>
        [0, 1, 2, 3].some((off) => (thumbStart + off) % total === k);
      if (!inWindow(idx)) setThumbStart(idx);
    } else {
      setThumbStart(0);
    }
  };

  // ===== Tạo danh sách index 4 ảnh hiển thị (carousel vòng tròn)
  const visibleThumbIndices = (() => {
    if (!total) return [];
    if (total <= 4) return Array.from({ length: total }, (_, i) => i);
    const arr = [];
    for (let k = 0; k < 4; k++) arr.push((thumbStart + k) % total);
    return arr;
  })();

  // ===== Gallery: điều khiển cửa sổ 4 thumbnail (vòng tròn)
  const shiftThumbWindow = (delta) => {
    if (total <= 4) return;
    setThumbStart((s) => {
      const next = (s + delta + total) % total;
      return next;
    });
  };

  const handleBookRoom = () => {
    if (!isLoggedIn) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để đặt lịch xem phòng.",
        confirmButtonText: "Đến đăng nhập",
        confirmButtonColor: "#7c3aed",
      }).then((r) => r.isConfirmed && navigate("/login"));
    } else {
      setShowModal(true);
    }
  };

  return (
    <div style={{ paddingTop: 80 }}>
      <Header />

      {/* Nội dung chính */}
      <div
        style={{
          ...styles.page,
          animation: animatePage ? "fadeSlideIn 1s ease-out" : "none",
        }}
      >
        {/* Ảnh + gallery */}
        <div style={styles.left}>
          <div style={styles.mainImageWrap}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.img
                key={currentImg}
                src={room.images?.[currentImg]?.url}
                alt={room.apartmentName}
                style={styles.mainImage}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
              />
            </AnimatePresence>

            {/* Nút chuyển ảnh lớn */}
            <button
              className="img-nav prev"
              onClick={() => changeImage(currentImg - 1)}
              aria-label="Ảnh trước"
            >
              <FaChevronLeft />
            </button>
            <button
              className="img-nav next"
              onClick={() => changeImage(currentImg + 1)}
              aria-label="Ảnh sau"
            >
              <FaChevronRight />
            </button>

            {/* badge góc ảnh */}
            <div style={styles.cornerBadge}>
              {room.price?.toLocaleString()} VND/tháng
            </div>
          </div>

          {/* Gallery thumbnails + 2 nút điều khiển riêng */}
          <div style={{ position: "relative" }}>
            <div style={styles.gallery}>
              {visibleThumbIndices.map((i) => {
                const img = room.images[i];
                const active = currentImg === i;
                return (
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    key={`thumb-${i}`}
                    src={img?.url}
                    alt={`gallery-${i}`}
                    style={{
                      ...styles.thumb,
                      boxShadow: active ? "0 0 0 3px #7c3aed" : "0 0 0 2px transparent",
                      opacity: active ? 1 : 0.75,
                    }}
                    onClick={() => changeImage(i)}
                  />
                );
              })}
            </div>

            {total > 4 && (
              <>
                <button
                  className="thumb-nav prev"
                  onClick={() => shiftThumbWindow(-1)}
                  aria-label="Lùi gallery"
                >
                  <FaChevronLeft />
                </button>
                <button
                  className="thumb-nav next"
                  onClick={() => shiftThumbWindow(1)}
                  aria-label="Tiến gallery"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>

          {/* Tiện ích */}
          <div style={styles.amenitiesSection}>
            <h3 style={styles.sectionTitle}>Tiện ích chung</h3>
            <div style={styles.amenitiesGrid}>
              {[
                { icon: faVideo, text: "Camera an ninh", key: "camera" },
                { icon: faLock, text: "Khóa cổng thông minh", key: "smartLock" },
                { icon: faFireExtinguisher, text: "Bình chữa cháy", key: "fireExtinguisher" },
                { icon: faBell, text: "Thiết bị báo cháy", key: "fireAlarm" },
                { icon: faStairs, text: "Thang bộ thoát hiểm", key: "staircase" },
                { icon: faToilet, text: "Vệ sinh khép kín", key: "privateToilet" },
                { icon: faSquareParking, text: "Khu để xe", key: "parking" },
                { icon: faShirt, text: "Khu giặt chung", key: "washingArea" },
                { icon: faBuilding, text: "Thang máy", key: "elevator" },
              ]
                .filter((a) => room.commonAmenities?.[a.key])
                .map((amenity, idx) => (
                  <div key={idx} style={styles.amenityItem}>
                    <div style={styles.amenityIcon}>
                      <FontAwesomeIcon icon={amenity.icon} />
                    </div>
                    <div style={styles.amenityText}>{amenity.text}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Thông tin */}
        <div style={styles.right}>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>{room.apartmentName}</h1>

            {/* % hoa hồng */}
            <div style={styles.commBadge} title="Mức hoa hồng">
              {commission}%
            </div>

            <FaHeart
              style={{
                ...styles.heartIcon,
                color: favourites[room._id] ? "red" : "#ddd",
              }}
              onClick={() => toggleFavourite(room._id)}
              className="heart-anim"
            />
          </div>

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
          </div>

          <p style={styles.desc}>{room.description}</p>

          {/* Phí dịch vụ */}
          <div style={styles.servicesSection}>
            <h3 style={styles.sectionTitle}>Phí dịch vụ chung</h3>
            <div style={styles.servicesGrid}>
              <div style={styles.serviceItem}>
                <div style={styles.serviceLabel}>Điện</div>
                <div style={styles.serviceValue}>
                  {room.utilities?.electricity} đ/kWh
                </div>
              </div>
              <div style={styles.serviceItem}>
                <div style={styles.serviceLabel}>Nước</div>
                <div style={styles.serviceValue}>
                  {room.utilities?.water} đ/m³
                </div>
              </div>
              <div style={styles.serviceItem}>
                <div style={styles.serviceLabel}>Internet</div>
                <div style={styles.serviceValue}>
                  {room.utilities?.internet} đ/tháng
                </div>
              </div>
              <div style={styles.serviceItem}>
                <div style={styles.serviceLabel}>Dịch vụ</div>
                <div style={styles.serviceValue}>
                  {room.utilities?.service} đ/tháng
                </div>
              </div>
            </div>
          </div>

          {/* Liên hệ */}
         {/* Liên hệ */}
          <div style={styles.contactBox}>
            <h3 style={styles.contactTitle}>Liên hệ chủ phòng</h3>
            <div style={styles.contactItem}>
              📞 {isPhoneVisible ? room.create_by?.phone || "Chưa có" : "*******"}
              <button onClick={togglePhoneVisibility} style={styles.toggleButton}>
                {isPhoneVisible ? "Ẩn số" : "Hiện số"}
              </button>
            </div>
            <div style={styles.contactItem}>
              📧 {room.create_by?.email || "contact@roomyrent.vn"}
            </div>

              {room.status === "đã thuê" ? (
  <button style={styles.rentedBtn} disabled>
     Phòng đã có người thuê
  </button>
) : (
  <button style={styles.ctaBtn} onClick={handleBookRoom}>
    Đặt lịch xem phòng
  </button>
)}


          </div>

        </div>
      </div>

      {/* Modal đặt lịch */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
  <h2 style={styles.modalTitle}>📅 Đặt lịch xem phòng</h2>
  <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
    <FaTimes />
  </button>

  {hasBooked && (
    <div style={styles.alertBooked}>
      ✅ Bạn đã đặt lịch phòng này rồi. Xem tại{" "}
      <a href="/profile" style={styles.alertLink}>hồ sơ cá nhân</a>.
    </div>
  )}

<form style={styles.form} onSubmit={handleSubmit}>
  <div style={styles.inputGroup}>
    <FaUser style={styles.icon} />
    <input
      type="text"
      name="name"
      placeholder="Họ và tên"
      value={form.name}
      onChange={handleChange}
      style={styles.input}
      required
    />
  </div>

  <div style={styles.inputGroup}>
    <FaEnvelope style={styles.icon} />
    <input
      type="email"
      name="email"
      placeholder="Email"
      value={form.email}
      onChange={handleChange}
      style={styles.input}
      required
    />
  </div>

  <div style={styles.inputGroup}>
    <FaPhone style={styles.icon} />
    <input
      type="tel"
      name="phone"
      placeholder="Số điện thoại"
      value={form.phone}
      onChange={handleChange}
      style={styles.input}
      required
    />
  </div>

  <div style={styles.inputGroup}>
    <FaMapMarkerAlt style={styles.icon} />
    <input
      type="text"
      name="address"
      placeholder="Địa chỉ"
      value={form.address}
      onChange={handleChange}
      style={styles.input}
    />
  </div>

  <div style={styles.inputGroup}>
    <FaCalendarAlt style={styles.icon} />
    <DatePicker
      selected={form.date}
      onChange={(date) => setForm({ ...form, date })}
      placeholderText="Chọn ngày"
    />
  </div>

  <div style={styles.inputGroup}>
    <FaClock style={styles.icon} />
    <input
      type="time"
      name="time"
      value={form.time}
      onChange={handleChange}
      style={styles.input}
    />
  </div>

  <div style={styles.textareaGroup}>
    <textarea
      name="note"
      placeholder="Ghi tên + SĐT khách hàng"
      value={form.note}
      onChange={handleChange}
      style={styles.textarea}
    />
  </div>

  <div style={styles.modalActions}>
    <button
      type="button"
      style={styles.cancelBtn}
      onClick={() => setShowModal(false)}
    >
      Hủy
    </button>
    <button type="submit" style={styles.confirmBtn}>
      Xác nhận
    </button>
  </div>
</form>

</div>

        </div>
      )}
<RelatedRooms
  districtCode={room?.district?.code}
  districtName={room?.district?.name}
  excludeId={room?._id}
/>




      <Footer />
      <StyleTag />
    </div>
  );
}

/* =================== Styles =================== */
const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "40px",
    padding: "40px 60px",
    fontFamily: "'Poppins', sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  left: { display: "flex", flexDirection: "column", gap: "20px" },

  mainImageWrap: {
    position: "relative",
    width: "100%",
    height: "450px",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    background: "#f3f4f6",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    userSelect: "none",
    pointerEvents: "none",
  },
  cornerBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: 10,
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
    transition: "box-shadow .2s ease, transform .2s ease",
    background: "#eee",
  },

  right: {
    background: "#fff",
    padding: "35px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    animation: "fadeInRight 1s ease",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  title: { fontSize: "30px", fontWeight: "700", color: "#1f2937", margin: 0 },
  commBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 13,
  },
  heartIcon: { fontSize: 22, marginLeft: "auto", cursor: "pointer", transition: "all .25s" },

  location: { fontSize: "16px", color: "#6b7280", display: "flex", gap: "6px" },
  price: { fontSize: "24px", fontWeight: "700", color: "#7c3aed", margin: "10px 0" },
  details: { display: "flex", gap: "24px", fontSize: "15px", color: "#374151", flexWrap: "wrap" },
  desc: { fontSize: "15px", lineHeight: 1.7, color: "#4b5563", marginTop: "10px" },

  contactBox: {
    marginTop: "20px",
    padding: "25px",
    borderRadius: "16px",
    background: "linear-gradient(135deg,#eef2ff,#ffffff)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  contactTitle: { fontSize: "18px", fontWeight: "600", color: "#111827" },
  contactItem: { fontSize: "15px", color: "#374151" },
  ctaBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "12px 0",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor:"pointer"
  },

  toggleButton: {
    marginLeft: "10px",
    padding: "5px 10px",
    borderRadius: "8px",
    background: "#7c3aed",
    color: "#fff",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    animation: "overlayFadeIn 0.4s ease forwards",
  },
  modal: {
    background: "#fff",
    padding: "25px 30px",
    borderRadius: "16px",
    width: "420px",
    maxHeight: "85vh",
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "relative",
    animation: "modalPopIn .5s cubic-bezier(0.22,1,0.36,1)",
  },
  closeBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#6b7280",
    transition: "transform 0.3s ease, color 0.3s ease",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "10px",
    cursor:"pointer"
  },

  form: { display: "flex", flexDirection: "column", gap: "14px" },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    background: "#f9fafb",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "10px 14px",
    gap: "10px",
  },
  textareaGroup: { background: "#f9fafb", border: "1px solid #ddd", borderRadius: "10px", padding: "10px 14px" },
  textarea: {
    width: "100%",
    height: "90px",
    resize: "none",
    border: "none",
    outline: "none",
    fontSize: "14px",
    background: "transparent",
    color: "#111",
  },
  icon: { color: "#8a5cff", fontSize: "16px" },
  input: { flex: 1, border: "none", outline: "none", fontSize: "14px", background: "transparent", color: "#111" },
  modalActions: { display: "flex", gap: "12px", marginTop: "10px" },
  cancelBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#374151",
    fontWeight: "600",
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

  amenitiesSection: {
    marginTop: "40px",
    padding: "30px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
  },
  servicesSection: {
    marginTop: "0px",
    padding: "20px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
  },
  sectionTitle: { fontSize: "20px", fontWeight: "700", color: "#333", marginBottom: "20px" },
  amenitiesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" },
  servicesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" },
  amenityItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#f9fafb",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  serviceItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  amenityIcon: { fontSize: "24px", color: "#7c3aed" },
  amenityText: { fontSize: "16px", color: "#333", fontWeight: "500" },
  serviceLabel: { fontSize: "16px", color: "#555" },
  serviceValue: { fontSize: "16px", color: "#7c3aed", fontWeight: "600" },
rentedBtn: {
  marginTop: "12px",
  width: "100%",
  padding: "12px 0",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg,#facc15,#fbbf24)", // vàng dịu
  color: "#78350f", // nâu đậm
  fontSize: "16px",
  fontWeight: "600",
  cursor: "not-allowed",
  letterSpacing: "0.3px",
  boxShadow: "0 4px 12px rgba(250,204,21,0.4)",
  transition: "all .3s ease",
},

alertBooked: {
  padding: "12px",
  borderRadius: "10px",
  background: "#ecfdf5",
  border: "1px solid #86efac",
  color: "#16a34a",
  fontWeight: 600,
  textAlign: "center",
  marginBottom: "10px",
},
alertLink: { color: "#16a34a", textDecoration: "underline" },



};

/* Extra CSS (keyframes, buttons…) */
function StyleTag() {
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
    .react-datepicker-wrapper { flex: 1; }
    .react-datepicker__input-container input {
      width: 100%; border: none; outline: none; background: transparent;
      font-size: 14px; color: #111;
    }

    /* Nút điều hướng ảnh lớn */
    .img-nav{
      position:absolute; top:50%; transform:translateY(-50%);
      width:42px; height:42px; border-radius:999px;
      border:none; background:rgba(255,255,255,.9);
      box-shadow:0 8px 20px rgba(0,0,0,.18);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:all .2s ease;
      z-index:3;
    }
    .img-nav:hover{ transform:translateY(-50%) scale(1.06); background:#fff; }
    .img-nav.prev{ left:12px; }
    .img-nav.next{ right:12px; }

    /* Nút điều hướng cho gallery 4 thumbnail */
    .thumb-nav{
      position:absolute; top:50%; transform:translateY(-50%);
      width:32px; height:32px; border-radius:50%;
      border:none; background:rgba(255,255,255,0.95);
      box-shadow:0 4px 12px rgba(0,0,0,0.15);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:all .2s ease; z-index:2;
    }
    .thumb-nav.prev{ left:-20px; }
    .thumb-nav.next{ right:-20px; }
    .thumb-nav:hover{ background:#7c3aed; color:#fff; }

    .heart-anim{ transition:transform .25s ease; }
    .heart-anim:hover{ transform:scale(1.15); }

    @keyframes fadeSlideIn{ from{opacity:0; transform:translateY(40px);} to{opacity:1; transform:translateY(0);} }
    @keyframes fadeInRight{ from{opacity:0; transform:translateX(40px);} to{opacity:1; transform:translateX(0);} }
    @keyframes overlayFadeIn{ from{opacity:0;} to{opacity:1;} }
    @keyframes modalPopIn{ 0%{opacity:0; transform:scale(.9) translateY(10px);} 100%{opacity:1; transform:scale(1) translateY(0);} }
    @keyframes softPulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.92; }
  100% { transform: scale(1); opacity: 1; }
}


    .close-btn:hover{ transform:rotate(90deg) scale(1.2); color:#8a5cff; }
    `;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);
  return null;
}
