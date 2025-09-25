// services/scheduleService.js
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL;

// ================== Helper ==================
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập hoặc token không tồn tại");
  return { Authorization: `Bearer ${token}` };
};

// ================== API CALLS ==================

/**
 * ✅ Tạo lịch xem phòng
 * @param {Object} scheduleData
 *  {
 *    room_id,
 *    customer_name,
 *    customer_phone,
 *    start_time,
 *    end_time (optional),
 *    note
 *  }
 */
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

/**
 * ✅ Lấy tất cả lịch (Admin xem tất cả)
 */
export const getSchedules = async () => {
  try {
    const res = await axios.get(`${API_URL}/schedules`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách lịch:", err.response?.data || err.message);
    throw err.response?.data || "Lỗi lấy danh sách lịch";
  }
};

/**
 * ✅ Cập nhật lịch
 * @param {String} id 
 * @param {Object} updateData 
 */
export const updateSchedule = async (id, updateData) => {
  try {
    const res = await axios.put(`${API_URL}/schedules/${id}`, updateData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật lịch:", err.response?.data || err.message);
    throw err.response?.data || "Lỗi cập nhật lịch";
  }
};

/**
 * ✅ Xoá lịch
 * @param {String} id 
 */
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

/**
 * ✅ Lấy lịch của chính user
 */
export const getMySchedules = async () => {
  try {
    const res = await axios.get(`${API_URL}/schedules/me`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi lấy lịch của tôi:", err.response?.data || err.message);
    throw err.response?.data || "Không thể tải lịch sử đặt lịch";
  }
};

/**
 * ✅ Kiểm tra nhân sự có rảnh trong khoảng thời gian không
 * @param {String} staffId 
 * @param {String} start_time (ISO string)
 * @param {Number} duration (minutes, default = 60)
 */
export const checkStaffAvailability = async (staffId, start_time, duration = 60) => {
  try {
    const res = await axios.get(
      `${API_URL}/schedules/staff/${staffId}/availability`,
      {
        params: { time: start_time, duration },
        headers: getAuthHeaders(),
      }
    );
    return res.data; // { available: true/false, conflicts: [...] }
  } catch (err) {
    console.error("❌ Lỗi khi check availability:", err.response?.data || err.message);
    throw err.response?.data || "Không thể kiểm tra lịch nhân sự";
  }
};

// ================== SOCKET.IO ==================
const socket = io(API_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

/**
 * ✅ Đăng ký sự kiện realtime
 */
export const subscribeSchedules = (onCreated, onUpdated, onDeleted) => {
  if (onCreated) socket.on("scheduleCreated", onCreated);
  if (onUpdated) socket.on("scheduleUpdated", onUpdated);
  if (onDeleted) socket.on("scheduleDeleted", onDeleted);
};

/**
 * ✅ Hủy đăng ký sự kiện realtime
 */
export const unsubscribeSchedules = () => {
  socket.off("scheduleCreated");
  socket.off("scheduleUpdated");
  socket.off("scheduleDeleted");
};

// ✅ Xuất socket
export { socket };
