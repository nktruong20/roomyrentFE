import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { login } from "../services/authService"; 
import Swal from "sweetalert2";  

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await login(form); // ✅ gọi API login
  
      console.log("✅ Đăng nhập thành công!");
      console.log("🔑 Token:", token);
      console.log("👤 User:", user);
  
      // Nếu người dùng KHÔNG chọn "Remember me" thì chỉ lưu session
      if (!rememberMe) {
        sessionStorage.setItem("token", token);
        localStorage.removeItem("token"); // Xóa token trong localStorage nếu có
      } else {
        localStorage.setItem("token", token);
      }
  
      Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công!",
        confirmButtonText: "Đóng",
      }).then(() => {
        // ✅ Điều hướng theo role
        if (user.role === "boss") {
          navigate("/admin/dashboard");
        } else if (user.role === "assistant" || user.role === "admin") {
          navigate("/admin/room"); // cho vào quản lý phòng
        } else if (user.role === "CTV") {
          navigate("/rooms");
        } else {
          navigate("/"); // fallback
        }
        
      });
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
  
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại!",
        text: error?.message || "Vui lòng thử lại",
        confirmButtonText: "Đóng",
      });
    }
  };
  

  return (
    <div style={styles.page}>
      {/* Left Pane */}
      <div style={styles.leftPane}>
        <img
          src="https://lumitex.vn/upload/data/images/thiet-ke-noi-that-nha-pho-dong-nai-anh-quoc-1478_background.jpg"
          alt="Modern apartment"
          style={styles.image}
        />
        <div style={styles.overlay}></div>
        <div
          style={{
            ...styles.textBlock,
            ...(animate ? styles.fadeInUp : styles.hidden),
          }}
        >
          <p style={styles.subText}>WELCOME BACK</p>
          <h1 style={styles.mainText}>
            <span style={styles.gradientText}>Find Your Space</span>
          </h1>
          <p style={styles.tagline}>
            Khám phá không gian sống hiện đại, tiện nghi và lý tưởng dành cho bạn.
          </p>
          <button style={styles.ctaBtn} onClick={() => navigate("/")}>
            Khám phá ngay →
          </button>
        </div>
      </div>

      {/* Right Pane */}
      <div style={styles.rightPane}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Đăng nhập</h2>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email</label>
            <div style={styles.inputWrapper}>
              <input
                style={styles.input}
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
              <span style={styles.focusBorder}></span>
            </div>
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Mật khẩu</label>
            <div style={styles.inputWrapper}>
              <input
                style={styles.input}
                type={showPwd ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
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
          </div>

          {/* Remember Me */}
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              style={styles.checkbox}
            />
            <label htmlFor="rememberMe" style={styles.checkboxLabel}>
              Lưu thông tin đăng nhập
            </label>
          </div>

          {/* Submit */}
          <button type="submit" style={styles.submit}>Đăng nhập</button>

          {/* Switch */}
          <p style={styles.switch}>
            Bạn chưa có tài khoản?{" "}
            <Link to="/register" style={styles.link}>Đăng ký</Link>
          </p>
        </form>
      </div>
    </div>
  );
};


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
    fontSize: 18,
    fontWeight: 400,
    color: "#d1d5db",
    margin: 0,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  mainText: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.2,
    marginTop: 12,
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
    color: "#e5e7eb",
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
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "5px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    margin: "0 10px",
    fontSize: 13,
    color: "#bbb",
  },
  socialContainer: {
    display: "flex",
    gap: 12,
    marginTop: 6,
    marginBottom: 10,
  },
  socialBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 15,
    border: "none",
    cursor: "pointer",
    transition: "transform .2s, box-shadow .2s",
  },
  google: {
    background: "#222",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
  },
  facebook: {
    background: "#3b5998",
    color: "#fff",
  },
  icon: {
    width: 20,
    height: 20,
  },
  switch: { marginTop: 16, fontSize: 14, textAlign: "center", color: "#ccc" },
  link: { color: "#9faeff", textDecoration: "none", cursor: "pointer" },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    cursor: "pointer",
    background:"black"
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#bbb",
  },
};

// hiệu ứng focus glow
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

export default Login;
