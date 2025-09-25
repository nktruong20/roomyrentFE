import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StudentRoom from "../components/StudentRoom";
import BannerCarousel from "../components/BannerCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faHeart } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Swal from "sweetalert2";
import { getRooms } from "../services/roomService";
import {
  addFavourite,
  removeFavourite,
  getFavouritesByUser,
} from "../services/favouriteService";
import { getMe } from "../services/authService";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    activeTab: "Nhà đất cho thuê",
    keyword: "",
    minPrice: "",
    maxPrice: "",
    type: "",
    city: "",
    district: "",
    wards: [],
    minArea: "",
    maxArea: "",
  });

  const [visiblePhones, setVisiblePhones] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [favourites, setFavourites] = useState({});
  const [user, setUser] = useState(null);

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const navigate = useNavigate();
  const listRef = useRef(null); // 👉 để scroll xuống danh sách

  // Rút gọn địa chỉ hiển thị
  const shortAddress = (address) => {
    if (!address) return "";
    const parts = address.split(",");
    let result = parts.slice(-2).join(",").trim();
    result = result.replace(/Thành phố\s+/gi, "");
    result = result.replace(/Tỉnh\s+/gi, "");
    return result;
  };

  // Lấy user
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

  // Lấy danh sách rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
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
useEffect(() => {
  window.scrollTo({ top: 600, behavior: "smooth" });
}, [currentPage]);

  // Lấy danh sách yêu thích khi có user
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
        console.error("❌ Lỗi khi lấy favourites:", err);
      }
    };
    fetchFavourites();
  }, [user]);

  // Hiện số điện thoại
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

  // Thêm / Xóa yêu thích
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

  // FILTER logic
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const {
        minPrice,
        maxPrice,
        type,
        city,
        district,
        wards,
        minArea,
        maxArea,
        keyword,
      } = filters;

      if (keyword && !room.address?.toLowerCase().includes(keyword.toLowerCase()))
        return false;
      if (minPrice && room.price < Number(minPrice)) return false;
      if (maxPrice && room.price > Number(maxPrice)) return false;
      if (minArea && room.area < Number(minArea)) return false;
      if (maxArea && room.area > Number(maxArea)) return false;
      if (type && room.type !== type) return false;
      if (city && !room.address?.includes(city)) return false;
      if (district && !room.address?.includes(district)) return false;
      if (wards.length > 0 && !wards.some((w) => room.address?.includes(w)))
        return false;

      return true;
    });
  }, [filters, rooms]);

  // Pagination
  const cardsPerPage = 12;
  const totalPages = Math.ceil(filteredRooms.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const paginatedRooms = filteredRooms.slice(
    startIndex,
    startIndex + cardsPerPage
  );

  // Khi bấm tìm kiếm ở BannerCarousel → scroll tới list
  const handleSearch = (filterValues) => {
    setFilters((prev) => ({ ...prev, ...filterValues }));
    setTimeout(() => {
      if (listRef.current) {
        const yOffset = -120; // 👉 chỉnh khoảng trống stop
        const y =
          listRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 300);
  };

  if (loading)
    return <p style={{ padding: "40px" }}>⏳ Đang tải dữ liệu...</p>;

  return (
    <div style={{ paddingTop: 80 }}>
      <Header />
      <div style={styles.page}>
        {/* ✅ Nhận filter từ BannerCarousel */}
        <BannerCarousel onSearch={handleSearch} />

        <motion.p
          style={{ fontSize: "28px", fontWeight: "780", marginBottom: "20px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Danh sách căn hộ đang mở cho thuê
        </motion.p>

        <div ref={listRef} style={styles.grid}>
          {paginatedRooms.map((room, index) => {
            const phoneVisible = visiblePhones[room._id];
            const maskedPhone =
              room.create_by?.phone?.slice(0, 7) + " ..." || "Ẩn số";
            const isFav = favourites[room._id];
            return (
              <motion.div
                key={room._id}
                style={styles.card}
                onClick={() => navigate(`/rooms/${room._id}`)}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                <div style={styles.imageWrapper}>
                  <img
                    src={room.images?.[0]?.url}
                    alt={room.name}
                    style={styles.image}
                  />
                  <div style={styles.priceTag}>
                    {room.price.toLocaleString()} VND/tháng
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.nameRow}>
                    <h3 style={styles.roomName}>
                      {room.apartmentName || "Không có tên"}
                    </h3>
                    {room.commission_percent && (
                      <span
                        className="commission-badge"
                        data-tooltip={`Hoa hồng: ${(
                          (room.price * room.commission_percent) /
                          100
                        ).toLocaleString()} VND`}
                      >
                        {room.commission_percent}%
                      </span>
                    )}
                  </div>

                  <p style={styles.roomInfo}>
                    {room.type} • {room.area} m² • {shortAddress(room.address)}
                  </p>

                  <div style={styles.posterRow}>
                    <img
                      src={
                        room.create_by?.avatar || "https://i.pravatar.cc/50"
                      }
                      alt={room.create_by?.name || "Người đăng"}
                      style={styles.avatar}
                    />
                    <div>
                      <p style={styles.posterName}>
                        {room.create_by?.name || "Người đăng"}
                      </p>
                      <p style={styles.postedTime}>
                        {new Date(room.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div style={styles.actionRow}>
                    <button
                      style={styles.phoneBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhone(room._id, room.create_by?.phone);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPhone}
                        style={{ marginRight: "6px" }}
                      />
                      {phoneVisible
                        ? room.create_by?.phone || "Chưa có"
                        : maskedPhone}
                    </button>
                    <button
                      style={styles.favoriteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(room._id);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faHeart}
                        style={{ color: isFav ? "red" : "#ccc" }}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Không tìm thấy phòng */}
          {filteredRooms.length === 0 && (
            <motion.div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "60px 20px",
                background: "#f9fafb",
                borderRadius: "12px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div
                style={{
                  border: "6px solid #f3f3f3",
                  borderTop: "6px solid #8a5cff",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  margin: "0 auto 20px",
                  animation: "spin 1s linear infinite",
                }}
              />
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111" }}>
                Không tìm thấy phòng nào phù hợp
              </h3>
              <p style={{ fontSize: "15px", color: "#555", marginTop: "8px" }}>
                Bạn có thể thử thay đổi bộ lọc hoặc tìm kiếm với lựa chọn khác!
              </p>
            </motion.div>
          )}
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
              style={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === i + 1
                    ? styles.activePageBtn
                    : styles.inactivePageBtn),
                }}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              style={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              »
            </button>
          </motion.div>
        )}

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <StudentRoom />
        </motion.div>
      </div>
      <Footer />

      {/* Spinner CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    padding: "30px 20px",
    fontFamily: "'Poppins', sans-serif",
    background: "#f9fafb",
    minHeight: "100vh",
  },

 filterBar: {
  margin: "0 auto 30px",
  width: "97%",
  display: "flex",
  flexDirection: "column", 
  gap: "16px",
  padding: "20px",
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
},


  // Tabs
  tabs: {
    display: "flex",
    gap: "10px",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    background: "#f3f4f6",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    transition: "all 0.3s",
  },
  activeTab: {
    background: "#fff",
    border: "2px solid rgb(138, 92, 255)",
    color: "rgb(138, 92, 255)",
    // boxShadow: "0 2px 8px rgb(138, 92, 255)",
  },

  // ===== SEARCH BAR =====
  searchRow: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    width: "98%",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "15px",
    fontFamily: "inherit",
  },
  searchBtn: {
    background: "rgb(138, 92, 255)",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "12px",
    fontWeight: "600",
    transition: "all 0.3s",
  },

  // ===== FILTER ROW (All filter buttons in one row) =====
  filterRow: {
    display: "flex",  // 👉 Changed to horizontal row
    gap: "12px",
    width: "100%",
    justifyContent: "space-between", // Distribute evenly
  },
  filterBtn: {
    flex: 1,
    background: "#fff",
    border: "1px solid #ddd",
    padding: "12px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: "500",
    fontSize: "15px",
    transition: "all 0.3s",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ===== DROPDOWN =====
  dropdown: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    marginTop: "6px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },
  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    fontWeight: "600",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    margin: "6px 0",
    width: "100%",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  // ===== GRID & CARD =====
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "30px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, boxShadow 0.3s",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  imageWrapper: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  priceTag: {
    position: "absolute",
    bottom: "0px",
    right: "0px",
    background: "#000",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  cardBody: { padding: "16px" },
  roomName: { fontSize: "18px", fontWeight: "600", marginBottom: "6px" },
  roomInfo: { fontSize: "14px", color: "#6b7280", marginBottom: "12px" },
  posterRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%" },
  posterName: { fontSize: "14px", fontWeight: "600", margin: 0 },
  postedTime: { fontSize: "12px", color: "#6b7280", margin: 0 },

  actionRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  phoneBtn: {
    flex: 1,
    background: "#8a5cff",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginRight: "10px",
  },
  favoriteBtn: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: "16px",
  },

  // ===== PAGINATION =====
  pagination: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },
  pageBtn: {
    minWidth: "36px",
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #8a5cff",
    cursor: "pointer",
    fontSize: "14px",
    color: "#8a5cff",
    background: "#fff",
    transition: "all 0.3s",
  },
  activePageBtn: { background: "#8a5cff", color: "#fff", fontWeight: "700" },
  inactivePageBtn: { background: "#fff", color: "#8a5cff" },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  
  commissionBadge: {
    display: "inline-block",
    marginLeft: "8px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: 600,
    borderRadius: "8px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    cursor: "default",
    position: "relative",
    transition: "all 0.25s ease",
  },
  
  commissionBadgeHover: {
    transform: "scale(1.1)",
    boxShadow: "0 4px 10px rgba(99, 102, 241, 0.4)",
  },
  
  tooltip: {
    position: "absolute",
    bottom: "125%",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#111827",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    whiteSpace: "nowrap",
    opacity: 0,
    pointerEvents: "none",
    transition: "opacity 0.3s, transform 0.3s",
    zIndex: 10,
  },
  tooltipVisible: {
    opacity: 1,
    transform: "translateX(-50%) translateY(-4px)",
  },
  
  
};
const style = document.createElement("style");
style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

