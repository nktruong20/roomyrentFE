import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../services/authService";

const PrivateRoute = ({ children, role }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }
        const data = await getMe(); // gọi API backend
        setUser(data);
      } catch (err) {
        console.error("Lỗi getMe:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  if (loading) return <p>⏳ Đang kiểm tra quyền truy cập...</p>;

  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default PrivateRoute;
