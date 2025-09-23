import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { FaSearch, FaHeart, FaMobileAlt, FaBuilding } from "react-icons/fa";

export default function About() {
  const navigate = useNavigate();

  // Auto scroll lên top khi vào
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  // Các block thông tin (giống intro section)
  const introSections = [
    {
      title: "Về chúng tôi",
      desc: "RoomyRent ra đời với sứ mệnh mang đến nền tảng hiện đại, minh bạch cho việc tìm kiếm và cho thuê phòng trọ. Chúng tôi kết nối hàng ngàn người thuê và chủ trọ trên khắp cả nước, giúp việc tìm kiếm nơi ở mới trở nên dễ dàng hơn bao giờ hết.",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    },
    {
      title: "Sứ mệnh của chúng tôi",
      desc: "Chúng tôi mong muốn xây dựng cộng đồng thuê trọ văn minh, nơi mọi người có thể tìm thấy không gian sống an toàn, tiện nghi, phù hợp với nhu cầu cá nhân. RoomyRent cam kết mang đến trải nghiệm minh bạch, dễ sử dụng và đáng tin cậy.",
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    },
    {
      title: "Tầm nhìn",
      desc: "RoomyRent không chỉ dừng lại ở nền tảng đăng và tìm phòng, chúng tôi hướng tới việc trở thành hệ sinh thái toàn diện về chỗ ở – từ việc tìm phòng, thuê, quản lý chi phí cho đến dịch vụ hỗ trợ sinh hoạt.",
      img: "https://images.unsplash.com/photo-1709145883296-4443310e3be0?q=80&w=1170&auto=format&fit=crop",
    },
  ];

  return (
    <div style={{ paddingTop: 70, background: "#f9fafb" }}>
      <Header />

      {/* Hero Section */}
      <section style={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={styles.heroTitle}>Khám phá không gian sống dễ dàng</h1>
          <p style={styles.heroDesc}>
            RoomyRent giúp bạn tìm, đăng tin và thuê phòng trọ một cách nhanh
            chóng, minh bạch và tiện lợi hơn bao giờ hết.
          </p>
        </motion.div>
      </section>

      {/* Intro Sections */}
      {introSections.map((s, i) => (
        <section
          key={i}
          style={{
            ...styles.intro,
            flexDirection: i % 2 === 0 ? "row" : "row-reverse",
          }}
        >
          <motion.div
            style={styles.introText}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 style={styles.sectionTitle}>{s.title}</h2>
            <p style={styles.introDesc}>{s.desc}</p>
          </motion.div>
          <motion.img
            src={s.img}
            alt={s.title}
            style={styles.introImg}
            initial={{ x: i % 2 === 0 ? 100 : -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          />
        </section>
      ))}

      {/* Features */}
      <section style={styles.section}>
        <motion.h2
          style={styles.sectionTitle}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Tại sao chọn <span style={{ color: "#8a5cff" }}>RoomyRent?</span>
        </motion.h2>
        <div style={styles.featuresGrid}>
          {[
            {
              icon: <FaSearch />,
              title: "Tìm kiếm nhanh chóng",
              desc: "Bộ lọc thông minh giúp bạn tìm đúng phòng trọ phù hợp.",
            },
            {
              icon: <FaBuilding />,
              title: "Nguồn tin uy tín",
              desc: "Thông tin phòng được xác minh, minh bạch, rõ ràng.",
            },
            {
              icon: <FaHeart />,
              title: "Yêu thích & lưu trữ",
              desc: "Lưu lại những phòng bạn quan tâm để dễ dàng so sánh.",
            },
            {
              icon: <FaMobileAlt />,
              title: "Trải nghiệm đa nền tảng",
              desc: "Dùng mọi lúc, mọi nơi trên cả điện thoại và máy tính.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              style={styles.featureCard}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section style={styles.sectionAlt}>
        <motion.h2
          style={styles.sectionTitle}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Đội ngũ <span style={{ color: "#8a5cff" }}>RoomyRent</span>
        </motion.h2>
        <div style={styles.teamGrid}>
          {[
            {
              name: "Nguyễn Văn A",
              role: "Founder & CEO",
              avatar: "https://i.pravatar.cc/200?img=12",
            },
            {
              name: "Trần Thị B",
              role: "Product Manager",
              avatar: "https://i.pravatar.cc/200?img=32",
            },
            {
              name: "Lê Văn C",
              role: "UI/UX Designer",
              avatar: "https://i.pravatar.cc/200?img=45",
            },
            {
              name: "Phạm Thị D",
              role: "Marketing",
              avatar: "https://i.pravatar.cc/200?img=18",
            },
          ].map((m, i) => (
            <motion.div
              key={i}
              style={styles.teamCard}
              whileHover={{ rotate: 2, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <img src={m.avatar} alt={m.name} style={styles.teamAvatar} />
              <h4 style={styles.teamName}>{m.name}</h4>
              <p style={styles.teamRole}>{m.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <motion.section
        style={styles.cta}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={{ color: "#fff", fontSize: 28, marginBottom: 20 }}>
          Sẵn sàng tìm phòng trọ lý tưởng cho bạn?
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
    textAlign: "center",
    padding: "100px 20px",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    borderRadius: "0 0 40px 40px",
  },
  heroTitle: { fontSize: 42, fontWeight: 700, marginBottom: 20 },
  heroDesc: { fontSize: 18, maxWidth: 700, margin: "0 auto" },

  intro: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 40,
    padding: "80px 20px",
    maxWidth: 1100,
    margin: "0 auto",
    flexWrap: "wrap",
  },
  introText: { flex: 1 },
  introDesc: { fontSize: 16, color: "#4b5563", marginTop: 20, lineHeight: 1.6 },
  introImg: {
    flex: 1,
    maxWidth: 500,
    borderRadius: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },

  section: { padding: "80px 20px", textAlign: "center" },
  sectionAlt: { padding: "80px 20px", background: "#f3f4f6", textAlign: "center" },
  sectionTitle: { fontSize: 32, fontWeight: 700, marginBottom: 40 },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: 30,
    maxWidth: 1100,
    margin: "0 auto",
  },
  featureCard: {
    background: "#fff",
    padding: 30,
    borderRadius: 20,
    boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
    transition: "all 0.3s",
  },
  featureIcon: { fontSize: 30, color: "#8a5cff", marginBottom: 15 },
  featureTitle: { fontSize: 18, fontWeight: 600, marginBottom: 10 },
  featureDesc: { fontSize: 14, color: "#6b7280" },

  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 30,
    maxWidth: 1000,
    margin: "0 auto",
  },
  teamCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
  },
  teamAvatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    marginBottom: 15,
    objectFit: "cover",
  },
  teamName: { fontSize: 16, fontWeight: 600, margin: 0 },
  teamRole: { fontSize: 14, color: "#6b7280", margin: 0 },

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
