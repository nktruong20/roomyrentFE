import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { FaHeart, FaMapMarkerAlt, FaDollarSign, FaPhone } from "react-icons/fa";

// Components
import Header from "../components/Header";
import Footer from "../components/Footer";

// Services
import {
  getFavouritesByUser,
  removeFavourite,
} from "../services/favouriteService";

// ====== Component ======
export default function Favourite() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6; // ✅ 9 card / trang

  // Scroll to top khi mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch favourites
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getFavouritesByUser(); // [{ _id, room_id: {...} }]
        if (mounted) setFavourites(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi lấy favourites:", err);
        if (mounted) setFavourites([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset page khi danh sách thay đổi
  useEffect(() => {
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [favourites.length]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(favourites.length / PER_PAGE));
  const paged = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return favourites.slice(start, start + PER_PAGE);
  }, [favourites, page]);

  const goTo = (p) => {
    const newPage = Math.min(Math.max(1, p), totalPages);
    setPage(newPage);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const visiblePages = useMemo(() => {
    const max = 5;
    if (totalPages <= max)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 2);
    let end = start + max - 1;
    if (end > totalPages) {
      end = totalPages;
      start = end - max + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Helpers
  const getRoom = (fav) => fav?.room_id || fav;
  const roomId = (fav) => getRoom(fav)?._id || fav?._id;
  const roomTitle = (fav) =>
    getRoom(fav)?.apartmentName || getRoom(fav)?.title || "Không rõ";
  const roomPrice = (fav) => getRoom(fav)?.price || 0;
  const roomImage = (fav) =>
    getRoom(fav)?.images?.[0]?.url ||
    getRoom(fav)?.image ||
    "https://via.placeholder.com/600x360?text=No+Image";

  // 👉 Hàm rút gọn địa chỉ
  const shortAddress = (address) => {
    if (!address) return "";
    const parts = address.split(",");
    let result = parts.slice(-2).join(",").trim();
    result = result.replace(/Thành phố\s+/gi, "");
    result = result.replace(/Tỉnh\s+/gi, "");
    return result;
  };

  const roomAddr = (fav) => {
    const r = getRoom(fav);
    return shortAddress(r?.address || r?.location || "");
  };

  // Unlike với SweetAlert
  const handleUnlike = async (e, favouriteId) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Bỏ yêu thích?",
      text: "Bạn có chắc chắn muốn bỏ yêu thích phòng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Bỏ thích",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await removeFavourite(favouriteId);
      setFavourites((prev) => prev.filter((f) => f._id !== favouriteId));
      Swal.fire({
        icon: "success",
        title: "Đã bỏ thích!",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("❌ Bỏ thích thất bại:", err);
      Swal.fire("Lỗi", "Không thể bỏ thích. Vui lòng thử lại.", "error");
    }
  };

  return (
    <div style={{ paddingTop: 70, background: "#f7f7fb", minHeight: "100vh" }}>
      <Header />

      {/* Hero */}
      <section style={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 style={styles.heroTitle}>Danh sách yêu thích</h1>
          <p style={styles.heroDesc}>
            Lưu lại những căn phòng bạn ưng ý. Quay lại sau chỉ với một cú nhấp!
          </p>
        </motion.div>
        <div style={styles.blob} />
      </section>

      {/* Content */}
      <section style={styles.section}>
        {/* Loading skeleton */}
        {loading && (
          <div style={styles.grid}>
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={styles.skeletonImg} />
                <div style={{ padding: 16 }}>
                  <div style={styles.skeletonLine} />
                  <div style={{ ...styles.skeletonLine, width: "60%" }} />
                  <div style={{ ...styles.skeletonLine, width: "40%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && favourites.length === 0 && (
          <motion.p
            style={{ fontSize: 18, color: "#6b7280" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Bạn chưa có phòng nào trong danh sách yêu thích.
          </motion.p>
        )}

        {/* List */}
        {!loading && favourites.length > 0 && (
          <>
            <div style={styles.grid}>
              <AnimatePresence mode="popLayout">
                {paged.map((fav) => (
                  <motion.div
                    key={fav._id}
                    style={styles.card}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => navigate(`/rooms/${roomId(fav)}`)}
                  >
                    {/* Image */}
                    <div style={styles.imageWrap}>
                      <img
                        src={roomImage(fav)}
                        alt={roomTitle(fav)}
                        style={styles.cardImg}
                      />
                      <div style={styles.priceTag}>
                        {roomPrice(fav).toLocaleString("vi-VN")} VND/tháng
                      </div>
                      <button
                        aria-label="Bỏ thích"
                        style={styles.heartBtn}
                        onClick={(e) => handleUnlike(e, fav._id)}
                      >
                        <FaHeart />
                      </button>
                    </div>

                    {/* Content */}
                    <div style={styles.cardContent}>
                      <h3 style={styles.cardTitle}>{roomTitle(fav)}</h3>
                      {/* <p style={styles.meta}>
                        <FaDollarSign />{" "}
                        <b>{roomPrice(fav).toLocaleString("vi-VN")} VND/tháng</b>
                      </p> */}
                      <p style={styles.meta}>
                        <FaMapMarkerAlt /> {roomAddr(fav)}
                      </p>

                      {/* Owner */}
                      {getRoom(fav)?.createdBy && (
                        <div style={styles.ownerRow}>
                          <img
                            src={
                              getRoom(fav)?.createdBy?.avatar ||
                              "https://i.pravatar.cc/50"
                            }
                            alt={getRoom(fav)?.createdBy?.name || "Chủ phòng"}
                            style={styles.avatar}
                          />
                          <div>
                            <div style={styles.ownerName}>
                              {getRoom(fav)?.createdBy?.name ||
                                "Người đăng"}
                            </div>
                            <div style={styles.ownerDate}>
                              {getRoom(fav)?.createdAt
                                ? new Date(
                                    getRoom(fav).createdAt
                                  ).toLocaleDateString("vi-VN")
                                : ""}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={styles.actions}>
                        <button
                          style={styles.primaryBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rooms/${roomId(fav)}`);
                          }}
                        >
                          <FaPhone /> 0397643 ***
                        </button>
                        <button
                          style={styles.secondaryBtn}
                          onClick={(e) => handleUnlike(e, fav._id)}
                        >
                          <FaHeart /> Bỏ thích
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            <div style={styles.pagination}>
              <button
                style={styles.pageBtn}
                disabled={page === 1}
                onClick={() => goTo(1)}
              >
                «
              </button>
              <button
                style={styles.pageBtn}
                disabled={page === 1}
                onClick={() => goTo(page - 1)}
              >
                ‹
              </button>
              {visiblePages.map((p) => (
                <button
                  key={p}
                  style={{
                    ...styles.pageBtn,
                    ...(p === page ? styles.pageActive : {}),
                  }}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              ))}
              <button
                style={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => goTo(page + 1)}
              >
                ›
              </button>
              <button
                style={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => goTo(totalPages)}
              >
                »
              </button>
            </div>

            <div style={styles.pageInfo}>
              Hiển thị{" "}
              <b>
                {(page - 1) * PER_PAGE + 1}–
                {Math.min(page * PER_PAGE, favourites.length)}
              </b>{" "}
              / <b>{favourites.length}</b> phòng
            </div>
          </>
        )}
      </section>

      <Footer />

      <StyleInject />
    </div>
  );
}

/** ========= Styles ========= */
const styles = {
  hero: {
    position: "relative",
    textAlign: "center",
    padding: "120px 20px",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6,#4f46e5)",
    backgroundSize: "300% 300%",
    color: "#fff",
    overflow: "hidden",
    animation: "gradientShift 8s ease infinite",
  },
  heroTitle: { fontSize: 44, fontWeight: 800, marginBottom: 16 },
  heroDesc: { fontSize: 18, opacity: 0.95, maxWidth: 760, margin: "0 auto" },
  blob: {
    position: "absolute",
    width: 420,
    height: 420,
    background: "rgba(255,255,255,0.12)",
    borderRadius: "50%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    filter: "blur(80px)",
    animation: "blobMove 12s infinite alternate ease-in-out",
  },
  section: { padding: "56px 20px", textAlign: "center" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
    maxWidth: 1160,
    margin: "0 auto",
  },
  skeletonCard: {
    borderRadius: 18,
    background: "#fff",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
  },
  skeletonImg: {
    height: 180,
    background: "linear-gradient(90deg, #eee, #f5f5f5, #eee)",
    animation: "shimmer 1.5s linear infinite",
  },
  skeletonLine: {
    height: 12,
    margin: "10px 0",
    borderRadius: 8,
    background: "linear-gradient(90deg, #eee, #f5f5f5, #eee)",
    animation: "shimmer 1.5s linear infinite",
  },
  card: {
    borderRadius: 18,
    background: "#fff",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    overflow: "hidden",
  },
  imageWrap: { position: "relative", height: 180, overflow: "hidden" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" },
  priceTag: {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: "rgba(0,0,0,.75)",
    color: "#fff",
    padding: "6px 10px",
    borderTopLeftRadius: 10,
    fontSize: 12,
    fontWeight: 700,
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(255,255,255,.9)",
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    color: "#ef4444",
    cursor: "pointer",
  },
  cardContent: {
    padding: 16,
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 17, fontWeight: 700, margin: 0 },
  meta: {
    fontSize: 14,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: 6,
    margin: 0,
  },
  ownerRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 },
  avatar: { width: 32, height: 32, borderRadius: "50%" },
  ownerName: { fontSize: 14, fontWeight: 600 },
  ownerDate: { fontSize: 12, color: "#6b7280" },
  actions: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "#f3f4f6",
    color: "#374151",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  pagination: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    marginTop: 18,
  },
  pageBtn: {
    minWidth: 42,
    height: 38,
    borderRadius: 10,
    border: "1.5px solid #8b5cf6",
    background: "#fff",
    color: "#6d28d9",
    fontWeight: 800,
    cursor: "pointer",
  },
  pageActive: {
    background: "#7c3aed",
    color: "#fff",
    borderColor: "transparent",
    boxShadow: "0 6px 16px rgba(124,58,237,.35)",
  },
  pageInfo: { marginTop: 8, fontSize: 13, color: "#6b7280" },
};

// keyframes
function StyleInject() {
  useEffect(() => {
    const sheet = document.createElement("style");
    sheet.innerHTML = `
      @keyframes gradientShift {
        0% {background-position: 0% 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0% 50%;}
      }
      @keyframes blobMove {
        0% { transform: translate(-50%, -50%) scale(1); }
        100% { transform: translate(-50%, -60%) scale(1.25); }
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @media (max-width: 1024px) {
        section div[style*="grid-template-columns"] {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
      @media (max-width: 640px) {
        section div[style*="grid-template-columns"] {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(sheet);
    return () => document.head.removeChild(sheet);
  }, []);
  return null;
}
