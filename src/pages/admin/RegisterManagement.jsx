import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { registerManagement } from "../../services/authService";
import Swal from "sweetalert2";

export default function RegisterManagement() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showRoles, setShowRoles] = useState(false);
  const [hovered, setHovered] = useState(null);

  // ✅ Khi vào trang này thì set attribute để CSS override
  useEffect(() => {
    document.body.setAttribute("data-page", "register");
    return () => document.body.removeAttribute("data-page");
  }, []);

  const roles = [
    { value: "admin", label: "Quản trị viên" },
    { value: "assistant", label: "Trợ lý" },
    { value: "user", label: "Người dùng" },
  ];

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      e.email = "Email chưa hợp lệ";
    if (form.password.length < 8) e.password = "Mật khẩu tối thiểu 8 ký tự";
    if (!form.role) e.role = "Vui lòng chọn phân quyền";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, role: true });
    if (!isValid) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      await registerManagement(form);
      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công!",
        confirmButtonText: "Đóng",
      }).then(() => navigate("/login"));
    } catch (error) {
      setErrorMessage(error);
      Swal.fire({
        icon: "error",
        title: "Đã có lỗi xảy ra!",
        text: error,
        confirmButtonText: "Đóng",
      });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    setTimeout(() => setAnimate(true), 150);
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
            Tạo tài khoản để bắt đầu hành trình tìm không gian sống lý tưởng của bạn.
          </p>
          <button style={styles.ctaBtn}>Khám phá ngay →</button>
        </div>
      </div>

      {/* Right Pane */}
      <div style={styles.rightPane}>
        <form style={styles.form} onSubmit={onSubmit}>
          <h2 style={styles.title}>Tạo tài khoản nhân sự</h2>

          <InputField
            label="Họ và tên"
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onBlur={() => setTouched({ ...touched, name: true })}
            placeholder="Nguyễn Văn A"
            error={touched.name && errors.name}
          />

          <InputField
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onBlur={() => setTouched({ ...touched, email: true })}
            placeholder="you@example.com"
            error={touched.email && errors.email}
          />

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Mật khẩu</label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(touched.password && errors.password ? styles.inputError : {}),
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
            </div>
            {touched.password && errors.password && (
              <span style={styles.error}>{errors.password}</span>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Vai trò</label>
            <div style={styles.dropdown}>
              <button
                type="button"
                style={styles.dropdownBtn}
                onClick={() => setShowRoles(!showRoles)}
              >
                {form.role ? roles.find((r) => r.value === form.role).label : "Phân quyền"}
                <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: 8 }} />
              </button>
              {showRoles && (
                <ul style={styles.dropdownMenu}>
                  {roles.map((role) => (
                    <li
                      key={role.value}
                      style={{
                        ...styles.dropdownItem,
                        ...(hovered === role.value ? styles.dropdownItemHover : {}),
                      }}
                      onMouseEnter={() => setHovered(role.value)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => {
                        setForm({ ...form, role: role.value });
                        setShowRoles(false);
                      }}
                    >
                      {role.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {touched.role && errors.role && (
              <span style={styles.error}>{errors.role}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || submitting}
            style={styles.submit}
          >
            {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>

          {errorMessage && <span style={styles.error}>{errorMessage}</span>}
        </form>
      </div>
    </div>
  );
}

function InputField({ label, id, type = "text", value, onChange, onBlur, placeholder, error }) {
  return (
    <div style={styles.field}>
      <label style={styles.label} htmlFor={id}>{label}</label>
      <div style={styles.inputWrapper}>
        <input
          style={{
            ...styles.input,
            ...(error ? styles.inputError : {}),
          }}
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
        />
      </div>
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    margin: 0,
    padding: 0,
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
    background: "linear-gradient(180deg, rgba(11,14,26,0.6), rgba(11,14,26,0.8))",
  },
  textBlock: { position: "absolute", left: 50, top: "50%", transform: "translateY(-50%)", maxWidth: "75%" },
  hidden: { opacity: 0, transform: "translateY(40px)" },
  fadeInUp: {
    opacity: 1,
    transform: "translateY(-50%)",
    transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
  },
  subText: { fontSize: 20, fontWeight: 500, color: "#f3f4f6", margin: 0 },
  mainText: { fontSize: 46, fontWeight: 700, lineHeight: 1.2, marginTop: 8, marginBottom: 12 },
  gradientText: {
    background: "linear-gradient(90deg, #8a5cff, #6d8bff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  tagline: { fontSize: 16, color: "#d1d5db", marginBottom: 20, lineHeight: 1.5 },
  ctaBtn: {
    padding: "10px 22px",
    borderRadius: 25,
    border: "none",
    background: "linear-gradient(90deg, #6d8bff, #8a5cff)",
    color: "#fff",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all .3s",
  },
  form: {
    width: "85%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 22,
    background: "rgba(255,255,255,0.06)",
    padding: 36,
    borderRadius: 20,
    boxShadow: "0 16px 50px rgba(0,0,0,0.7)",
    backdropFilter: "blur(16px)",
  },
  title: { fontSize: 28, fontWeight: 700, textAlign: "center" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 14, color: "#cfd2e6", marginLeft: 4 },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
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
    transition: "transform .2s, box-shadow .2s",
  },
  dropdown: { position: "relative" },
  dropdownBtn: {
    height: 48,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.15)",
    background: "rgba(20,25,45,0.85)",
    color: "#fff",
    padding: "0 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontSize: 15,
    width: "100%",
  },
  dropdownMenu: {
    position: "absolute",
    top: "110%",
    left: 0,
    right: 0,
    background: "#1b1f36",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
    animation: "fadeScale .25s ease",
    zIndex: 10,
  },
  dropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  dropdownItemHover: {
    background: "linear-gradient(90deg, #6d8bff33, #8a5cff33)",
    transform: "translateX(4px)",
  },
  
};
