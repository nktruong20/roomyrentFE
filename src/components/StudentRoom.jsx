// src/components/StudentRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faHeart } from "@fortawesome/free-solid-svg-icons";
import { getRooms } from "../services/roomService";
import {
  addFavourite,
  removeFavourite,
  getFavouritesByUser,
} from "../services/favouriteService";
import { getMe } from "../services/authService";
import Swal from "sweetalert2";

const StudentRoom = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visiblePhones, setVisiblePhones] = useState({});
  const [favourites, setFavourites] = useState({});
  const [user, setUser] = useState(null);

  const shortAddress = (address) => {
    if (!address) return "";
    const parts = address.split(",");
    let result = parts.slice(-2).join(",").trim();
    result = result.replace(/Thành phố\s+/gi, "TP ");
    result = result.replace(/Tỉnh\s+/gi, "T ");
    return result;
  };

  // ====== Lấy user ======
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

  // ====== Lấy rooms từ API ======
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi lấy rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // ====== Lấy danh sách favourites khi có user ======
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

  // ====== Lọc rooms giá ≤ 4 triệu ======
  const filteredRooms = useMemo(
    () => rooms.filter((r) => Number(r.price) <= 4_000_000),
    [rooms]
  );

  // ====== Slider settings ======
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };
// Arrow components
function NextArrow(props) {
  const { onClick } = props;
  return (
    <div
      className="arrow next"
      onClick={onClick}
      style={{ ...styles.arrow, right: -20, left: "auto" }} // 👉 chỉnh về bên phải
    >
      <FaChevronRight />
    </div>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <div
      className="arrow prev"
      onClick={onClick}
      style={{ ...styles.arrow, left: -20, right: "auto" }} // 👉 chỉnh về bên trái
    >
      <FaChevronLeft />
    </div>
  );
}


  // ====== Handlers ======
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

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        ⏳ Đang tải phòng giá ≤ 4.000.000...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Căn hộ Sinh viên</h2>

      <Slider {...sliderSettings}>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const id = room._id || room.id;
            const phoneVisible = visiblePhones[id];
            const phone = room.create_by?.phone || "";
            const maskedPhone = phone ? phone.slice(0, 7) + " ***" : "Ẩn số";
            const isFav = !!favourites[id];

            return (
              <div key={id} style={styles.cardWrapper}>
                <div
                  style={styles.card}
                  onClick={() => navigate(`/rooms/${id}`)}
                >
                  {/* Ảnh + giá */}
                  <div style={styles.imageWrapper}>
                    <img
                      src={room.images?.[0]?.url || "/placeholder.png"}
                      alt={room.apartmentName || room.name || "Room"}
                      style={styles.image}
                    />
                    <div style={styles.priceTag}>
                      {Number(room.price).toLocaleString()} VND/tháng
                    </div>
                  </div>

                  {/* Nội dung card */}
                  <div style={styles.cardBody}>
                    <div style={styles.nameRow}>
                      <h3 style={styles.roomName}>
                        {room.apartmentName || room.name || "Không có tên"}
                      </h3>
                      {room.commission_percent ? (
                        <span
                          style={styles.commissionBadge}
                          title={`Hoa hồng: ${(
                            (Number(room.price) *
                              Number(room.commission_percent)) /
                            100
                          ).toLocaleString()} VND`}
                        >
                          {room.commission_percent}%
                        </span>
                      ) : null}
                    </div>

                    <p style={styles.roomInfo}>
                      {room.type} • {room.area} m² • {shortAddress(room.address)}
                    </p>

                    {/* Người đăng */}
                    <div style={styles.posterRow}>
                      <img
                        src={room.create_by?.avatar || "https://i.pravatar.cc/50"}
                        alt={room.create_by?.name || "Người đăng"}
                        style={styles.avatar}
                      />
                      <div>
                        <p style={styles.posterName}>
                          {room.create_by?.name || "Người đăng"}
                        </p>
                        <p style={styles.postedTime}>
                          {room.createdAt
                            ? new Date(room.createdAt).toLocaleDateString("vi-VN")
                            : ""}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div style={styles.actionRow}>
                      <button
                        style={styles.phoneBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhone(id, phone);
                        }}
                      >
                        <FontAwesomeIcon icon={faPhone} style={{ marginRight: 6 }} />
                        {phoneVisible ? phone || "Chưa có" : `${maskedPhone}`}
                      </button>

                      <button
                        style={styles.favoriteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavourite(id);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faHeart}
                          style={{ color: isFav ? "red" : "#ccc" }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 20 }}>Không có phòng dưới hoặc bằng 4 triệu.</div>
        )}
      </Slider>
    </div>
  );
};

/* ====== Styles giữ nguyên layout ====== */
const styles = {
  page: {
    padding: "40px 40px",
    fontFamily: "'Poppins', sans-serif",
    background: "#f3f4f6",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  title: {
    fontSize: 28,
    fontWeight: 780,
    textAlign: "left",
    marginBottom: 40,
    background: "black",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: 1,
    textShadow: "0 3px 6px rgba(0,0,0,0.1)",
  },
 arrow: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  cursor: "pointer",
  position: "absolute",
  zIndex: 2,
  top: "45%",
},

 card: {
  background: "#fff",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  transition: "transform 0.3s, box-shadow 0.3s",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  margin: "0 15px",
  height: "100%",          // 🔑 chiếm full chiều cao của wrapper
  minHeight: 400,          // 🔑 đặt chiều cao tối thiểu cho đồng đều
},
cardWrapper: {
  padding: "0 15px",
  display: "flex",
  justifyContent: "center",
  alignItems: "stretch",   // 🔑 để tất cả card con cao bằng nhau
},

imageWrapper: {
  width: "100%",
  height: 200,      // 🔑 đồng bộ chiều cao ảnh
  position: "relative",
  overflow: "hidden",
},

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  priceTag: {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: "#000",
    color: "#fff",
    padding: "6px 12px",
    borderTopLeftRadius: 10,
    fontSize: 13,
    fontWeight: 600,
  },
  cardBody: { padding: 16 },
  nameRow: { display: "flex", alignItems: "center", gap: 6 },
  roomName: { fontSize: 16, fontWeight: 600, marginBottom: 6, color: "#111827" },
  roomInfo: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
  posterRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: "50%" },
  posterName: { fontSize: 14, fontWeight: 600, margin: 0 },
  postedTime: { fontSize: 12, color: "#6b7280", margin: 0 },
  actionRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  phoneBtn: {
    flex: 1,
    background: "#8b5cf6",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginRight: 10,
  },
  favoriteBtn: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: 16,
  },
  commissionBadge: {
    display: "inline-block",
    marginLeft: 8,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 8,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
  },
};

export default StudentRoom;
