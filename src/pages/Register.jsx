import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate để chuyển hướng
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { register } from "../services/authService"; // import hàm register từ authService
import Swal from "sweetalert2"; // Import SweetAlert2

export default function RegisterPage() {
  const navigate = useNavigate(); // Khai báo useNavigate để chuyển hướng
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Để hiển thị thông báo lỗi

  // Kiểm tra các lỗi nhập liệu
  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      e.email = "Email chưa hợp lệ";
    if (form.password.length < 8) e.password = "Mật khẩu tối thiểu 8 ký tự";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  // Hàm xử lý khi người dùng submit form
  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!isValid) return;
    setSubmitting(true);
    setErrorMessage(""); // Reset lỗi trước khi gửi

    try {
      const userData = await register(form); // Gọi API đăng ký
      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công!",
        confirmButtonText: "Đóng"
      }).then(() => {
        // Chuyển hướng người dùng đến trang đăng nhập sau khi đăng ký thành công
        navigate("/login");
      });
    } catch (error) {
      setErrorMessage(error); // Lấy lỗi từ API nếu có
      Swal.fire({
        icon: "error",
        title: "Đã có lỗi xảy ra!",
        text: error,
        confirmButtonText: "Đóng"
      });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    setTimeout(() => setAnimate(true), 150); // delay nhẹ cho mượt
  }, []);

  return (
    <div style={styles.page}>
      {/* Left Pane */}
      <div style={styles.leftPane}>
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1500&q=80"
          alt="Luxury room"
          style={styles.image}
        />
        <div style={styles.overlay}></div>
        <div
          style={{
            ...styles.textBlock,
            ...(animate ? styles.fadeInUp : styles.hidden),
          }}
        >
          <h2 style={styles.subText}>RoomyRent</h2>
          <h1 style={styles.mainText}>
            <span style={styles.gradientText}>Find Your Space</span>
          </h1>
          <p style={styles.tagline}>
            Tạo tài khoản để bắt đầu hành trình tìm không gian sống lý tưởng
            của bạn.
          </p>
          <button style={styles.ctaBtn}>Khám phá ngay →</button>
        </div>
      </div>

      {/* Right Pane */}
      <div style={styles.rightPane}>
        <form style={styles.form} onSubmit={onSubmit}>
          <h2 style={styles.title}>Tạo tài khoản</h2>

          {/* Name */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="name">
              Họ và tên
            </label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(touched.name && errors.name ? styles.inputError : {}),
                }}
                type="text"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={() => setTouched({ ...touched, name: true })}
                placeholder="Nguyễn Văn A"
              />
              <span style={styles.focusBorder}></span>
            </div>
            {touched.name && errors.name && (
              <span style={styles.error}>{errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(touched.email && errors.email ? styles.inputError : {}),
                }}
                type="email"
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="you@example.com"
              />
              <span style={styles.focusBorder}></span>
            </div>
            {touched.email && errors.email && (
              <span style={styles.error}>{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">
              Mật khẩu
            </label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(touched.password && errors.password
                    ? styles.inputError
                    : {}),
                }}
                type={showPwd ? "text" : "password"}
                id="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onBlur={() => setTouched({ ...touched, password: true })}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={styles.eyeBtn}
              >
                <FontAwesomeIcon icon={showPwd ? faEyeSlash : faEye} />
              </button>
              <span style={styles.focusBorder}></span>
            </div>
            {touched.password && errors.password && (
              <span style={styles.error}>{errors.password}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || submitting}
            style={styles.submit}
          >
            {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>

          {/* Error Message */}
          {errorMessage && (
            <span style={styles.error}>{errorMessage}</span>
          )}

          <p style={styles.agreement}>
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <a href="" style={styles.link}>
              Điều khoản
            </a>{" "}
            &{" "}
            <a href="" style={styles.link}>
              Chính sách
            </a>
          </p>

          <p style={styles.switch}>
            Bạn đã có tài khoản ?{" "}
            <Link to="/login" style={styles.link}>
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
const styles = {
  page: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "#0b0e1a",
    color: "#fff",
  },
  leftPane: { flex: 1, position: "relative", overflow: "hidden" },
  rightPane: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #14192c, #0b0e1a)",
  },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(11,14,26,0.6), rgba(11,14,26,0.8))",
  },
  textBlock: {
    position: "absolute",
    left: 50,
    top: "50%",
    transform: "translateY(-50%)",
    maxWidth: "75%",
  },
  hidden: { opacity: 0, transform: "translateY(40px)" },
  fadeInUp: {
    opacity: 1,
    transform: "translateY(-50%)",
    transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
  },
  subText: {
    fontSize: 20,
    fontWeight: 500,
    color: "#f3f4f6",
    margin: 0,
  },
  mainText: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.2,
    marginTop: 8,
    marginBottom: 12,
    color: "#fff",
    textShadow: "0 6px 25px rgba(0,0,0,0.6)",
  },
  gradientText: {
    background: "linear-gradient(90deg, #8a5cff, #6d8bff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  tagline: {
    fontSize: 16,
    color: "#d1d5db",
    marginBottom: 20,
    lineHeight: 1.5,
  },
  ctaBtn: {
    padding: "10px 22px",
    borderRadius: 25,
    border: "none",
    background: "linear-gradient(90deg, #6d8bff, #8a5cff)",
    color: "#fff",
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(109,139,255,0.4)",
    transition: "all .3s",
  },

  form: {
    width: "85%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 22,
    background: "rgba(255,255,255,0.06)",
    padding: 36,
    borderRadius: 20,
    boxShadow: "0 16px 50px rgba(0,0,0,0.7)",
    backdropFilter: "blur(16px)",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 14, color: "#cfd2e6", marginLeft: 4 },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.15)",
    background: "rgba(20,25,45,0.85)",
    padding: "0 44px 0 14px",
    color: "#fff",
    fontSize: 15,
    outline: "none",
    width: "100%",
    transition: "all .25s",
  },
  inputError: { borderColor: "#ff6b6b" },
  focusBorder: {
    position: "absolute",
    inset: -1,
    borderRadius: 14,
    padding: 2,
    background: "linear-gradient(90deg,#6d8bff,#8a5cff)",
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "destination-out",
    maskComposite: "exclude",
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity .25s",
  },
  error: { fontSize: 12, color: "#ff6b6b", marginLeft: 4 },
  eyeBtn: {
    position: "absolute",
    right: 14,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#bbb",
    fontSize: 16,
  },
  submit: {
    height: 48,
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg, #6d8bff, #8a5cff)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 14,
    boxShadow: "0 10px 28px rgba(109,139,255,.35)",
    transition: "transform .2s, box-shadow .2s",
  },
  agreement: {
    marginTop: 10,
    fontSize: 13,
    color: "#bbb",
    textAlign: "center",
  },
  switch: { marginTop: 16, fontSize: 14, textAlign: "center", color: "#ccc" },
  link: { color: "#9faeff", textDecoration: "none", cursor: "pointer" },
};

// hiệu ứng glow khi focus input
document.addEventListener("focusin", (e) => {
  if (e.target.tagName === "INPUT") {
    const border = e.target.parentElement.querySelector("span");
    if (border) border.style.opacity = 1;
  }
});
document.addEventListener("focusout", (e) => {
  if (e.target.tagName === "INPUT") {
    const border = e.target.parentElement.querySelector("span");
    if (border) border.style.opacity = 0;
  }
});
