import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";

export default function Contact() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

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
          <h1 style={styles.heroTitle}>Liên hệ với RoomyRent</h1>
          <p style={styles.heroDesc}>
            Hãy để lại lời nhắn hoặc liên hệ trực tiếp với chúng tôi.  
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
          </p>
        </motion.div>

        {/* Animated blob */}
        <div style={styles.blob}></div>
      </section>

      {/* Contact Info + Form */}
      <section style={styles.contactSection}>
        {/* Contact Info */}
        <motion.div
          style={styles.contactInfo}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={styles.sectionTitle}>Thông tin liên hệ</h2>
          <p style={styles.infoItem}>
            <FaMapMarkerAlt style={styles.icon} /> 60 Trần Đăng Ninh, P.Quang
            Trung, Q.Hà Đông, Hà Nội
          </p>
          <p style={styles.infoItem}>
            <FaPhone style={styles.icon} /> 090 660 25 77
          </p>
          <p style={styles.infoItem}>
            <FaEnvelope style={styles.icon} /> support@roomyrent.vn
          </p>
          <p style={styles.infoItem}>
            <FaClock style={styles.icon} /> Thứ 2 - Chủ Nhật: 8h00 - 22h00
          </p>

          {/* Google Map */}
            <iframe
  title="map"
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.67800109924!2d105.76745617502965!3d20.96544238066817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313452d9d15193db%3A0x105c3450735dda5a!2zNjAgUC5UcuG6p24gxJDEg25nIE5pbmgsIEjDoCBD4bqndSwgSMOgIMSQw7RuZywgSMOgIE7hu5lpIDEwMDAwLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1758080953371!5m2!1svi!2s"
  width="100%"
  height="300"
  style={{ border: 0, marginTop: 20, borderRadius: 12 }}
  allowFullScreen=""
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>

        </motion.div>

        {/* Contact Form */}
        <motion.div
          style={styles.contactForm}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 style={styles.sectionTitle}>Gửi tin nhắn</h2>
          <form style={styles.form}>
            <motion.input
              type="text"
              placeholder="Họ và tên"
              style={styles.input}
              whileFocus={{ scale: 1.02, borderColor: "#8a5cff" }}
            />
            <motion.input
              type="email"
              placeholder="Email"
              style={styles.input}
              whileFocus={{ scale: 1.02, borderColor: "#8a5cff" }}
            />
            <motion.input
              type="tel"
              placeholder="Số điện thoại"
              style={styles.input}
              whileFocus={{ scale: 1.02, borderColor: "#8a5cff" }}
            />
            <motion.textarea
              placeholder="Nội dung"
              rows={5}
              style={styles.textarea}
              whileFocus={{ scale: 1.02, borderColor: "#8a5cff" }}
            />
            <motion.button
              type="submit"
              style={styles.submitBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Gửi ngay
            </motion.button>
          </form>
        </motion.div>
      </section>

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

  contactSection: {
    display: "flex",
    gap: 40,
    padding: "80px 20px",
    maxWidth: 1100,
    margin: "0 auto",
    flexWrap: "wrap",
  },
  contactInfo: {
    flex: 1,
    background: "#fff",
    borderRadius: 20,
    padding: 30,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  contactForm: {
    flex: 1,
    background: "#fff",
    borderRadius: 20,
    padding: 30,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  sectionTitle: { fontSize: 26, fontWeight: 700, marginBottom: 20 },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "10px 0",
    color: "#374151",
    fontSize: 15,
  },
  icon: { color: "#8a5cff", minWidth: 20 },

  form: { display: "flex", flexDirection: "column", gap: 16 },
  input: {
    padding: "12px 15px",
    borderRadius: 10,
    border: "1px solid #ddd",
    fontSize: 14,
    outline: "none",
    transition: "0.2s",
  },
  textarea: {
    padding: "12px 15px",
    borderRadius: 10,
    border: "1px solid #ddd",
    fontSize: 14,
    outline: "none",
    resize: "none",
    transition: "0.2s",
  },
  submitBtn: {
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
    boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
  },
};

/* Keyframes cho gradient và blob */
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
