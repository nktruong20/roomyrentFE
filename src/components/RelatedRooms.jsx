// src/components/RelatedRooms.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { FaHeart, FaPhone } from "react-icons/fa";
import { getRoomsByDistrict } from "../services/roomService";
import {
  addFavourite,
  removeFavourite,
  getFavouritesByUser,
} from "../services/favouriteService";
import { getMe } from "../services/authService";

export default function RelatedRooms({ districtCode, districtName, excludeId }) {
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePhones, setVisiblePhones] = useState({});
  const [favourites, setFavourites] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const pageSize = 4;

  // ==== Get user ====
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // ==== Fetch rooms ====
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRoomsByDistrict(districtCode);
        setRooms(res.filter((r) => String(r._id) !== String(excludeId)));
        setCurrentPage(1);
      } catch (e) {
        console.error("❌ fetch related rooms:", e);
      }
    };
    if (districtCode) fetch();
  }, [districtCode, excludeId]);

  // ==== Fetch favourites when user ====
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user) return;
      try {
        const favs = await getFavouritesByUser(user._id);
        const favMap = {};
        favs.forEach((f) => {
          favMap[f.room_id._id] = f._id;
        });
        setFavourites(favMap);
      } catch (err) {
        console.error("❌ Lỗi lấy favourites:", err);
      }
    };
    fetchFavourites();
  }, [user]);

  if (!rooms.length) return null;

  // ==== Pagination ====
  const totalPages = Math.ceil(rooms.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentRooms = rooms.slice(startIndex, startIndex + pageSize);

  // ==== Handlers ====
  const togglePhone = (roomId, phone) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng đăng nhập!",
        text: "Để xem số điện thoại, bạn cần phải đăng nhập.",
        confirmButtonText: "Đăng nhập",
        confirmButtonColor: "#7c3aed",
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
    } else {
      setVisiblePhones((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
    }
  };

  const toggleFavourite = async (roomId) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để thêm phòng vào yêu thích.",
        confirmButtonText: "Đăng nhập",
        confirmButtonColor: "#7c3aed",
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
      return;
    }

    try {
      if (favourites[roomId]) {
        await removeFavourite(favourites[roomId]);
        setFavourites((prev) => {
          const newFav = { ...prev };
          delete newFav[roomId];
          return newFav;
        });
        Swal.fire("Đã xóa", "Bỏ phòng khỏi yêu thích", "success");
      } else {
        const res = await addFavourite(roomId);
        setFavourites((prev) => ({ ...prev, [roomId]: res._id }));
        Swal.fire("Thành công", "Đã thêm phòng vào yêu thích", "success");
      }
    } catch (err) {
      console.error("❌ Lỗi API:", err);
      Swal.fire("Lỗi", err.message || "Không thể xử lý yêu thích", "error");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Các phòng liên quan tại {districtName}</h2>
      <div style={styles.grid}>
        {currentRooms.map((room, index) => {
          const id = room._id;
          const phoneVisible = visiblePhones[id];
          const phone = room.createdBy?.phone || "";
          const maskedPhone = phone ? phone.slice(0, 7) + " ***" : "Ẩn số";
          const isFav = !!favourites[id];

          return (
            <motion.div
              key={id}
              style={styles.card}
              onClick={() => navigate(`/rooms/${id}`)}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              {/* Ảnh + Giá */}
              <div style={styles.imageWrap}>
                <img
                  src={room.images?.[0]?.url || "/default-room.jpg"}
                  alt={room.apartmentName || "Phòng trọ"}
                  style={styles.image}
                />
                <div style={styles.priceBadge}>
                  {room.price
                    ? `${room.price.toLocaleString()} VND/tháng`
                    : "Liên hệ"}
                </div>
              </div>

              {/* Nội dung */}
              <div style={styles.info}>
                <div style={styles.row}>
                  <h3 style={styles.name}>
                    {room.apartmentName || "Không có tên"}
                  </h3>
                  {room.commission_percent !== undefined && (
                    <span style={styles.commission}>
                      {room.commission_percent}%
                    </span>
                  )}
                </div>

                <p style={styles.meta}>
                  {room.type} • {room.area} m² •{" "}
                  {room.district?.name}, {room.province?.name}
                </p>

                {/* Chủ phòng */}
                <div style={styles.ownerRow}>
                  <img
                    src={room.createdBy?.avatar || "https://i.pravatar.cc/50"}
                    alt={room.createdBy?.name || "Chủ phòng"}
                    style={styles.avatar}
                  />
                  <div>
                    <div style={styles.ownerName}>
                      {room.createdBy?.name || "Chủ phòng"}
                    </div>
                    <div style={styles.ownerDate}>
                      {room.createdAt
                        ? new Date(room.createdAt).toLocaleDateString("vi-VN")
                        : ""}
                    </div>
                  </div>
                </div>

                {/* Hành động */}
                <div style={styles.actions}>
                  <button
                    style={styles.phoneBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhone(id, phone);
                    }}
                  >
                    <FaPhone style={{ marginRight: 6 }} />
                    {phoneVisible ? phone || "Chưa có" : maskedPhone}
                  </button>
                  <button
                    style={styles.heartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavourite(id);
                    }}
                  >
                    <FaHeart style={{ color: isFav ? "red" : "#ccc" }} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          style={styles.pagination}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={styles.pageBtn}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                ...styles.pageBtn,
                ...(page === currentPage ? styles.activePage : {}),
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={styles.pageBtn}
          >
            ›
          </button>
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: "50px",
    padding: "30px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: { fontSize: "22px", fontWeight: "700", marginBottom: "20px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#f9fafb",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 420,
  },
  imageWrap: { position: "relative", height: 200 },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  priceBadge: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    background: "#000",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    padding: "6px 10px",
    borderRadius: "8px",
  },
  info: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: "16px", fontWeight: "600", margin: 0 },
  commission: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff",
    background: "#7c3aed",
    borderRadius: "8px",
    padding: "2px 8px",
  },
  meta: { fontSize: "13px", color: "#6b7280" },
  ownerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "4px",
  },
  avatar: { width: "32px", height: "32px", borderRadius: "50%" },
  ownerName: { fontSize: "14px", fontWeight: "600", color: "#111" },
  ownerDate: { fontSize: "12px", color: "#6b7280" },
  actions: {
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phoneBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
    padding: "8px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    marginRight: 10,
  },
  heartBtn: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: 16,
  },
  // ===== Pagination styles =====
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "25px",
  },
  pageBtn: {
    minWidth: "40px",
    height: "40px",
    borderRadius: "8px",
    border: "1px solid #c4b5fd",
    background: "#fff",
    color: "#7c3aed",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all .2s",
  },
  activePage: {
    background: "#7c3aed",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
  },
};
