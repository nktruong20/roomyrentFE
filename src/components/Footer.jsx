import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot , faPhone  } from "@fortawesome/free-solid-svg-icons";


export default function Footer() {
  return (
    <footer style={styles.footer}>
      {/* Top section */}
      <div style={styles.container}>
        {/* Logo & Intro */}
        <div style={styles.col}>
          <h2 style={styles.logo}>
            <span style={styles.logoGradient}>RoomyRent</span>
          </h2>
          <p style={styles.text}>
            Nền tảng cho thuê phòng trọ, căn hộ và bất động sản uy tín. Giúp bạn
            tìm được không gian sống lý tưởng, hiện đại và tiện nghi.
          </p>
          <div style={styles.badges}>
            <span style={styles.badge}>✔️ Giấy phép kinh doanh</span>
            <span style={styles.badge}>🔒 ISO 27001:2013</span>
          </div>
        </div>

        {/* Services */}
        <div style={styles.col}>
          <h4 style={styles.title}>Dịch vụ</h4>
          <ul style={styles.list}>
            <li>Đăng tin cho thuê</li>
            <li>Tìm phòng nhanh</li>
            <li>Tư vấn hợp đồng</li>
            <li>Quản lý bất động sản</li>
            <li>Hỗ trợ khách thuê</li>
          </ul>
        </div>

        {/* Support */}
        <div style={styles.col}>
          <h4 style={styles.title}>Hỗ trợ</h4>
          <ul style={styles.list}>
            <li>Trung tâm trợ giúp</li>
            <li>Hướng dẫn đăng tin</li>
            <li>Biểu phí dịch vụ</li>
            <li>Câu hỏi thường gặp</li>
            <li>Chính sách & Điều khoản</li>
          </ul>
        </div>

        {/* Contact */}
        <div style={styles.col}>
          <h4 style={styles.title}>Liên hệ</h4>
          <p style={styles.text}>
  <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 8, color: "white" }} />
  60 Trần Đăng Ninh, P.Quang Trung, Q. Hà Đông, TP.Hà Nội
</p>
         <p style={styles.text}>
  <FontAwesomeIcon icon={faPhone} style={{ marginRight: 8, color: "white" }} />
  090 660 25 77
</p>
          <p style={styles.text}>✉️ support@roomyrent.com</p>

          <h4 style={{ ...styles.title, marginTop: 16 }}>Tải ứng dụng</h4>
          <div style={styles.appLinks}>
            <a href="/" style={styles.appBtn}>
              iOS App
            </a>
            <a href="/" style={styles.appBtn}>
              Android
            </a>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div style={styles.features}>
        <div style={styles.featureBox}>
          📊 <strong>Phân tích chuyên sâu</strong>
          <p style={styles.featureText}>
            Công cụ phân tích dữ liệu thuê phòng hiện đại.
          </p>
        </div>
        <div style={styles.featureBox}>
          ⚡ <strong>Giao dịch nhanh chóng</strong>
          <p style={styles.featureText}>
            Đăng tin và kết nối người thuê tức thì.
          </p>
        </div>
        <div style={styles.featureBox}>
          🔐 <strong>Bảo mật tối đa</strong>
          <p style={styles.featureText}>
            Công nghệ bảo mật dữ liệu người dùng.
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div style={styles.bottom}>
        <p style={styles.bottomText}>
          © {new Date().getFullYear()} RoomyRent. Bảo lưu mọi quyền. | Giấy phép
          số: 01/GP-BDS
        </p>
        <div style={styles.policyLinks}>
          <Link to="/" style={styles.policyLink}>
            Điều khoản
          </Link>
          <Link to="/" style={styles.policyLink}>
            Chính sách bảo mật
          </Link>
          <Link to="/" style={styles.policyLink}>
            Chính sách cookies
          </Link>
        </div>
        <div style={styles.socials}>
          <a href="/" style={styles.socialIcon}>
            🌐
          </a>
          <a href="/" style={styles.socialIcon}>
            📘
          </a>
          <a href="/" style={styles.socialIcon}>
            🐦
          </a>
          <a href="/" style={styles.socialIcon}>
            📸
          </a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: 60,
    background: "#0b0e1a",
    color: "#f3f4f6",
    paddingTop: 50,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 40,
    padding: "0 40px",
    marginBottom: 40,
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  logo: { fontSize: 26, fontWeight: 700, marginBottom: 10 },
  logoGradient: {
    background: "linear-gradient(90deg,#6d8bff,#8a5cff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  title: { fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#fff" },
  text: { fontSize: 14, color: "#d1d5db", lineHeight: 1.6 },
  list: {
    fontSize: 14,
    color: "#cfd2e6",
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  badges: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  badge: {
    fontSize: 13,
    background: "rgba(255,255,255,0.08)",
    padding: "6px 12px",
    borderRadius: 8,
    display: "inline-block",
    color: "#9ca3af",
  },
  appLinks: { display: "flex", gap: 10, marginTop: 6 },
  appBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 13,
    textDecoration: "none",
  },
  features: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px 40px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
  },
  featureBox: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 20,
    fontSize: 14,
    color: "#e5e7eb",
  },
  featureText: { marginTop: 6, fontSize: 13, color: "#9ca3af" },
  bottom: {
    marginTop: 30,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "20px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  bottomText: { fontSize: 13, color: "#9ca3af", textAlign: "center" },
  policyLinks: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  policyLink: {
    fontSize: 13,
    color: "#cfd2e6",
    textDecoration: "none",
  },
  socials: {
    display: "flex",
    gap: 12,
    marginTop: 10,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: "#fff",
    cursor: "pointer",
    transition: "all .3s",
  },
};
