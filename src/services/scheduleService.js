// services/scheduleService.js
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Helper để luôn gắn token vào header
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập hoặc token không tồn tại");
  return { Authorization: `Bearer ${token}` };
};

// ================== API CALLS ==================

// ✅ Tạo lịch xem phòng
export const createSchedule = async (scheduleData) => {
  try {
    const res = await axios.post(`${API_URL}/schedules`, scheduleData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi tạo lịch:", err.response?.data || err.message);
    throw err.response?.data || "Lỗi tạo lịch";
  }
};

// ✅ Lấy tất cả lịch (Admin xem tất cả)
export const getSchedules = async () => {
  try {
    const res = await axios.get(`${API_URL}/schedules`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ Lỗi khi lấy danh sách lịch:",
      err.response?.data || err.message
    );
    throw err.response?.data || "Lỗi lấy danh sách lịch";
  }
};

// ✅ Cập nhật lịch
export const updateSchedule = async (id, updateData) => {
  try {
    const res = await axios.put(`${API_URL}/schedules/${id}`, updateData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ Lỗi khi cập nhật lịch:",
      err.response?.data || err.message
    );
    throw err.response?.data || "Lỗi cập nhật lịch";
  }
};

// ✅ Xoá lịch
export const deleteSchedule = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/schedules/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi xoá lịch:", err.response?.data || err.message);
    throw err.response?.data || "Lỗi xoá lịch";
  }
};

// ✅ Lấy lịch của riêng tôi
export const getMySchedules = async () => {
  try {
    const res = await axios.get(`${API_URL}/schedules/me`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ Error fetching my schedules:",
      err.response?.data || err.message
    );
    throw err.response?.data || "Không thể tải lịch sử đặt lịch";
  }
};

// ================== SOCKET.IO ==================

// ✅ Khởi tạo socket
const socket = io(API_URL, {
  transports: ["websocket"], // ép dùng websocket cho nhanh và ổn định
  autoConnect: true,
});

// ✅ Lắng nghe sự kiện realtime từ server
export const subscribeSchedules = (onCreated, onUpdated, onDeleted) => {
  if (onCreated) socket.on("scheduleCreated", onCreated);
  if (onUpdated) socket.on("scheduleUpdated", onUpdated);
  if (onDeleted) socket.on("scheduleDeleted", onDeleted);
};

// ✅ Hủy lắng nghe (khi component unmount)
export const unsubscribeSchedules = () => {
  socket.off("scheduleCreated");
  socket.off("scheduleUpdated");
  socket.off("scheduleDeleted");
};

// ✅ Xuất luôn socket nếu cần xài chỗ khác
export { socket };
