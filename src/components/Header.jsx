import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons";

/**
 * Header — v0-style, CSS-only underline
 * - Container cố định: width = min(1200px, 100% - 32px), căn giữa
 * - Active underline 2px bám đúng giữa chữ (không lệch), animation scaleX
 * - Không dùng JS đo kích thước, không dùng border-bottom
 * - Nền tối phẳng + hairline pseudo-element
 * - Mobile menu slide-down
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const navLinks = useMemo(
    () => [
      { path: "/rooms", label: "Trang chủ" },
      { path: "/favourite", label: "Yêu thích" },
      { path: "/about", label: "Giới thiệu" },
      { path: "/contact", label: "Liên hệ" },
      // { path: "/services", label: "Dịch vụ" },
    ],
    []
  );

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  return (
    <header className="rr-header">
      <div className="rr-wrap">
        {/* Logo */}
        <Link to="/" className="logo" aria-label="RoomyRent">
          <LogoIcon />
          <span className="logo-text">RoomyRent</span>
        </Link>

        {/* Nav */}
        <nav className={`nav ${menuOpen ? "nav-open" : ""}`} aria-label="Chuyển trang">
          {navLinks.map((l) => {
            const isActive = location.pathname === l.path;
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`nav-item ${isActive ? "is-active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="label">{l.label}</span>
                <span className="underline" />
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <div className="search">
          <input type="text" placeholder="Tìm kiếm…" className="search-input" />
          <button className="search-btn" aria-label="Tìm kiếm">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        {/* Actions */}
        <div className="actions">
          {!isLoggedIn ? (
            <Link to="/login" className="btn-login">
              Đăng nhập
            </Link>
          ) : (
            <Link to="/profile" className="btn-avatar" aria-label="Hồ sơ">
              <FontAwesomeIcon icon={faUser} />
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="btn-menu"
            aria-label="Mở/đóng menu"
          >
            {menuOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      <style>{css}</style>
    </header>
  );
}

/* ===== Logo SVG gọn, màu sạch ===== */
function LogoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="rr-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9DB7FF" />
          <stop offset="60%" stopColor="#A98BFF" />
          <stop offset="100%" stopColor="#6FE3FF" />
        </linearGradient>
      </defs>
      <path d="M8 22L24 10l16 12v14a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V22z" fill="url(#rr-g)" />
      <rect x="18" y="26" width="12" height="10" rx="2" fill="#101629" opacity=".7" />
    </svg>
  );
}

/* ===== CSS (scoped) ===== */
const css = `
/* Header nền phẳng + hairline dưới (không border-bottom) */
.rr-header{
  position: fixed; inset: 0 0 auto 0; z-index: 50; width: 100%;
  background: rgba(20,23,35,.82);
  backdrop-filter: blur(12px);
}
.rr-header::after{
  content:""; position:absolute; left:0; right:0; bottom:0; height:1px;
  background: rgba(255,255,255,.06);
  transform: translateZ(0);
}

/* Container cố định, KHÔNG fluid */
.rr-wrap{
  width: min(1200px, 100% - 32px);
  margin: 0 auto;
  padding: 10px 0;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  column-gap: 16px;
}

/* Logo */
.logo{ display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-text{ color:#fff; font-weight:800; font-size:20px; letter-spacing:.2px; }

/* Nav */
.nav{
  position: relative;
  display:flex; align-items:center; justify-content:center; gap: 20px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(255,255,255,.04);
  outline: 1px solid rgba(255,255,255,.06);
  outline-offset: -1px;
}

/* Nav item — CSS-only underline bám đúng chữ */
.nav-item{
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  color:#d8dceb; font-size:14px; font-weight:700; text-decoration:none;
  border-radius:8px; transition:color .18s ease, transform .12s ease;
}
.nav-item .label{
  display:inline-block; padding:8px 10px 12px; /* padding chỉ áp vào chữ */
}
.nav-item:hover{ color:#fff; transform: translateY(-1px); }

/* Underline nằm giữa chữ, không tính padding ngoài */
.nav-item .underline{
  position:absolute; left:50%; bottom:2px; height:2px; width:100%;
  max-width: calc(100% - 8px); /* bớt 2px hai bên cho đẹp */
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  background: linear-gradient(90deg,#9DB7FF,#A98BFF,#6FE3FF);
  border-radius:2px;
  transition: transform .26s cubic-bezier(.22,.61,.36,1);
}
.nav-item.is-active{ color:#fff; }
.nav-item.is-active .underline{ transform: translateX(-50%) scaleX(1); }

/* Search */
.search{
  display:flex; align-items:center; gap:8px;
  padding:6px 10px; border-radius:10px;
  background: rgba(255,255,255,.06);
  outline: 1px solid rgba(255,255,255,.12); outline-offset:-1px;
}
.search-input{
  width:160px; border:none; outline:none; background:transparent;
  color:#fff; font-size:14px; transition:width .22s ease;
}
.search-input::placeholder{ color:#b7bfd3; }
.search-input:focus{ width:240px; }
.search-btn{ background:none; border:none; color:#cfd5e6; cursor:pointer; font-size:16px; }

/* Actions */
.actions{ display:flex; align-items:center; gap:10px; }
.btn-login{
  padding:10px 14px; border-radius:10px; color:#0f1424;
  font-weight:800; font-size:14px; text-decoration:none; white-space:nowrap;
  background: linear-gradient(90deg,#9DB7FF,#A98BFF,#6FE3FF);
  box-shadow: 0 8px 20px rgba(150,170,255,.28);
  transition: transform .16s ease, box-shadow .16s ease, filter .18s ease;
}
.btn-login:hover{ transform: translateY(-1px); box-shadow:0 12px 26px rgba(150,170,255,.38); filter:saturate(1.05); }

.btn-avatar{
  width:40px; height:40px; display:flex; align-items:center; justify-content:center;
  border-radius:8px; border:1px solid rgba(157,180,255,.7); color:#a8b6ff;
  transition: transform .16s ease, box-shadow .16s ease;
}
.btn-avatar:hover{ transform: translateY(-1px); box-shadow:0 8px 20px rgba(140,160,255,.3); }

.btn-menu{ display:none; background:none; border:none; color:#fff; font-size:20px; cursor:pointer; }

/* Mobile */
@media (max-width: 1100px){
  .search{ display:none !important; }
  .btn-menu{ display:block !important; }
  .nav{ gap:12px; }
  .nav-open{
    position:absolute; left:50%; transform:translateX(-50%);
    top: calc(100% + 8px);
    width: min(1200px, 100% - 32px);
    background: rgba(20,23,35,.98);
    outline-color: rgba(255,255,255,.08);
    flex-direction: column; padding: 10px; gap: 6px; border-radius: 12px;
    box-shadow: 0 16px 32px rgba(0,0,0,.45);
  }
}
`;
