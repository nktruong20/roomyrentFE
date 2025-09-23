import axios from "axios";

// ================== CẤU HÌNH API URL ==================
const API_URL = `${process.env.REACT_APP_API_URL}/commissions`;
console.log("🔗 Commission API_URL:", API_URL); // debug

// ================== HELPER: LẤY TOKEN ==================
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) throw new Error("❌ Chưa đăng nhập");
  return { Authorization: `Bearer ${token}` };
};

// ================== SERVICE FUNCTIONS ==================

/**
 * ✅ Lấy danh sách commission
 * - Boss → xem tất cả
 * - Role khác → backend tự động lọc theo user
 * - Có phân trang & filter theo status
 */
export const getCommissions = async (params = {}) => {
  try {
    console.log("📡 Gọi API getCommissions:", API_URL, params);
    const res = await axios.get(API_URL, {
      headers: getAuthHeaders(),
      params,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error getCommissions:", err);
    throw err.response?.data || err.message;
  }
};

/**
 * ✅ Lấy commission của user hiện tại (/me)
 */
export const getMyCommissions = async (params = {}) => {
  try {
    console.log("📡 Gọi API getMyCommissions:", `${API_URL}/me`, params);
    const res = await axios.get(`${API_URL}/me`, {
      headers: getAuthHeaders(),
      params,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error getMyCommissions:", err);
    throw err.response?.data || err.message;
  }
};

/**
 * ✅ Lấy chi tiết 1 commission
 */
export const getCommissionById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error getCommissionById:", err);
    throw err.response?.data || err.message;
  }
};

/**
 * ✅ Tạo commission mới (chỉ Boss/Admin)
 */
export const createCommission = async (data) => {
  try {
    const res = await axios.post(API_URL, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error createCommission:", err);
    throw err.response?.data || err.message;
  }
};

/**
 * ✅ Cập nhật trạng thái commission
 */
export const updateCommissionStatus = async (id, status) => {
  try {
    const res = await axios.put(
      `${API_URL}/${id}/status`,
      { status },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error("❌ Error updateCommissionStatus:", err);
    throw err.response?.data || err.message;
  }
};

/**
 * ✅ Xóa commission (chỉ Boss/Admin)
 */
export const deleteCommission = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error deleteCommission:", err);
    throw err.response?.data || err.message;
  }
};

/**
 * ✅ Lấy doanh thu + hoa hồng theo từng nhân sự
 * - Có thể truyền tháng: { month: "2025-09" }
 * - Boss/Admin → xem tất cả
 */
export const getStaffRevenue = async (params = {}) => {
  try {
    console.log("📡 Gọi API getStaffRevenue:", `${API_URL}/staff/revenue`, params);
    const res = await axios.get(`${API_URL}/staff/revenue`, {
      headers: getAuthHeaders(),
      params,
    });
    return res.data; // [{_id, name, email, role, revenue, commission}]
  } catch (err) {
    console.error("❌ Error getStaffRevenue:", err);
    throw err.response?.data || err.message;
  }
};
