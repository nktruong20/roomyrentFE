import axios from "axios";

// Lấy API_URL từ biến môi trường (.env)
const API_URL = process.env.REACT_APP_API_URL;

console.log("API_URL:", API_URL); // Debug

// ================= Helper: Lấy token =================
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) throw new Error("Chưa đăng nhập");
  return { Authorization: `Bearer ${token}` };
};

// ================= ĐĂNG KÝ =================
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    console.error("❌ Error during registration:", error);
    throw error.response?.data || "Đã có lỗi xảy ra khi đăng ký.";
  }
};

// ✅ Đăng ký nhân sự (Admin)
export const registerManagement = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/register-management`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error during management registration:", error);
    throw error.response?.data || "Đã có lỗi xảy ra khi tạo tài khoản nhân sự.";
  }
};

// ================= ĐĂNG NHẬP =================
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    const { token, user } = response.data;

    // Lưu token vào localStorage
    localStorage.setItem("token", token);

    return { token, user };
  } catch (error) {
    console.error("❌ Error during login:", error);
    throw error.response?.data || "Đã có lỗi xảy ra khi đăng nhập.";
  }
};

// ================= LẤY DANH SÁCH USER =================
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw error.response?.data || "Đã có lỗi xảy ra khi lấy danh sách người dùng.";
  }
};

// ================= ĐĂNG XUẤT =================
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/users/logout`);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    return { message: "Đăng xuất thành công" };
  } catch (error) {
    console.error("❌ Error during logout:", error);
    throw error.response?.data || "Đã có lỗi xảy ra khi đăng xuất.";
  }
};

// ================= CHECK LOGIN =================
export const isLoggedIn = () => !!getToken();

// ================= LẤY USER TỪ TOKEN LOCAL =================
export const getUserFromToken = () => {
  try {
    const token = getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // { id, name, email, role, iat, exp }
  } catch (error) {
    console.error("❌ Error decoding token:", error);
    return null;
  }
};

// ================= LẤY USER HIỆN TẠI =================
export const getMe = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error.response?.data || new Error("Chưa đăng nhập");
  }
};

// ================= UPDATE USER =================
export const updateUser = async (data) => {
  try {
    const response = await axios.put(`${API_URL}/users/me`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw error.response?.data || error.message || "Đã có lỗi xảy ra khi cập nhật thông tin.";
  }
};

// ================= LẤY DANH SÁCH NHÂN SỰ =================
export const getStaff = async () => {
  try {
    const res = await axios.get(`${API_URL}/users/staff`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching staff:", err);
    throw err.response?.data || "Không thể lấy danh sách nhân sự";
  }
};

// ================= LẤY DOANH THU + HOA HỒNG NHÂN SỰ =================
export const getStaffRevenue = async () => {
  try {
    const res = await axios.get(`${API_URL}/users/staff/revenue`, {
      headers: getAuthHeaders(),
    });
    return res.data; // [{name, email, role, totalRevenue, totalCommission}]
  } catch (err) {
    console.error("❌ Error fetching staff revenue:", err);
    throw err.response?.data || "Không thể lấy doanh thu nhân sự";
  }
};

// ================= UPDATE STAFF (Admin) =================
export const updateStaff = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/users/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error updating staff:", err);
    throw err.response?.data || "Không thể cập nhật nhân sự";
  }
};

// ================= DELETE STAFF (Admin) =================
export const deleteStaff = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data; // { message: "Xóa nhân sự thành công" }
  } catch (err) {
    console.error("❌ Error deleting staff:", err);
    throw err.response?.data || "Không thể xóa nhân sự";
  }
};
