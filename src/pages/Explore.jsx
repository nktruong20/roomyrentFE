import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { FaHome, FaStar, FaCity, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Explore() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  // Data demo cho danh mục khám phá
  const exploreData = [
    {
      title: "Phòng nổi bật",
      desc: "Khám phá các phòng được nhiều người quan tâm nhất.",
      icon: <FaStar />,
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    },
    {
      title: "Căn hộ trung tâm",
      desc: "Vị trí đắc địa, thuận tiện đi lại và làm việc.",
      icon: <FaCity />,
      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    },
    {
      title: "Phòng giá rẻ",
      desc: "Lựa chọn tiết kiệm, phù hợp sinh viên & người đi làm.",
      icon: <FaHome />,
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    },
    {
      title: "Cộng đồng RoomyRent",
      desc: "Tham gia cộng đồng hàng nghìn người thuê trọ.",
      icon: <FaUsers />,
      img: "https://images.unsplash.com/photo-1600585154203-95d1c7f8c9f4",
    },
  ];

  return (
    <div style={{ paddingTop: 70, background: "#f9fafb" }}>
      <Header />

      {/* Hero Section */}
      <section style={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={styles.heroTitle}>Khám phá RoomyRent</h1>
          <p style={styles.heroDesc}>
            Tìm cảm hứng cho chỗ ở tiếp theo của bạn. Khám phá danh mục phòng
            trọ đa dạng, phù hợp với mọi nhu cầu.
          </p>
        </motion.div>
        <div style={styles.blob}></div>
      </section>

      {/* Explore Grid */}
      <section style={styles.section}>
        <motion.h2
          style={styles.sectionTitle}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Danh mục nổi bật
        </motion.h2>
        <div style={styles.grid}>
          {exploreData.map((item, i) => (
            <motion.div
              key={i}
              style={styles.card}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <img src={item.img} alt={item.title} style={styles.cardImg} />
              <div style={styles.cardContent}>
                <div style={styles.cardIcon}>{item.icon}</div>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardDesc}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        style={styles.cta}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={{ color: "#fff", fontSize: 28, marginBottom: 20 }}>
          Sẵn sàng tìm phòng trọ lý tưởng?
        </h2>
        <button
          style={styles.ctaBtn}
          onClick={() => navigate("/rooms")}
        >
          Khám phá ngay
        </button>
      </motion.section>

      <Footer />
    </div>
  );
}

const styles = {
  hero: {
    position: "relative",
    textAlign: "center",
    padding: "120px 20px",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6,#4f46e5)",
    backgroundSize: "300% 300%",
    animation: "gradientShift 8s ease infinite",
    color: "#fff",
    overflow: "hidden",
  },
  heroTitle: { fontSize: 48, fontWeight: 800, marginBottom: 20 },
  heroDesc: { fontSize: 18, maxWidth: 700, margin: "0 auto" },

  blob: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    filter: "blur(80px)",
    animation: "blobMove 12s infinite alternate ease-in-out",
  },

  section: { padding: "80px 20px", textAlign: "center" },
  sectionTitle: { fontSize: 32, fontWeight: 700, marginBottom: 40 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: 30,
    maxWidth: 1100,
    margin: "0 auto",
  },
  card: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    background: "#fff",
    transition: "all 0.3s",
  },
  cardImg: {
    width: "100%",
    height: 180,
    objectFit: "cover",
  },
  cardContent: { padding: 20, textAlign: "left" },
  cardIcon: { fontSize: 24, color: "#8a5cff", marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: "#6b7280" },

  cta: {
    marginTop: 80,
    padding: "70px 20px",
    textAlign: "center",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
  },
  ctaBtn: {
    marginTop: 20,
    padding: "14px 30px",
    fontSize: 16,
    fontWeight: 600,
    border: "none",
    borderRadius: 12,
    background: "#fff",
    color: "#8a5cff",
    cursor: "pointer",
    boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
  },
};

/* Keyframes cho gradient + blob */
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes gradientShift {
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
  100% {background-position: 0% 50%;}
}`, styleSheet.cssRules.length);

styleSheet.insertRule(`
@keyframes blobMove {
  0% { transform: translate(-50%, -50%) scale(1); }
  100% { transform: translate(-50%, -60%) scale(1.3); }
}`, styleSheet.cssRules.length);
