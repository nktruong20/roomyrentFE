import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// 👉 Helper: lấy token
const authHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Tạo phòng
export const createRoom = async (roomData, files) => {
  try {
    let images = [];
    if (files && files.length > 0) {
      console.log("📤 Chuyển ảnh sang base64 để gửi lên API...");
      images = await Promise.all(
        files.map((file) =>
          toBase64(file).then((base64) => ({
            url: base64,
            isMain: false,
          }))
        )
      );
    }

    const payload = {
      ...roomData,
      price: Number(roomData.price.toString().replace(/,/g, "")),
      images,
    };

    console.log("📤 Tạo phòng mới với payload:", payload);

    const response = await axios.post(`${API_URL}/rooms`, payload, {
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    handleError("tạo phòng", error);
    throw error;
  }
};

// ✅ Lấy tất cả phòng (public, không cần token)
export const getRooms = async () => {
  try {
    const response = await axios.get(`${API_URL}/rooms`);
    return response.data;
  } catch (error) {
    handleError("lấy danh sách phòng", error);
    throw error;
  }
};

// ✅ Lấy phòng theo ID (public)
export const getRoomById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/rooms/${id}`);
    return response.data;
  } catch (error) {
    handleError("lấy chi tiết phòng", error);
    throw error;
  }
};

// ✅ Cập nhật phòng
export const updateRoom = async (id, roomData, files) => {
  try {
    let images = [];
    if (files && files.length > 0) {
      images = await Promise.all(
        files.map((file) =>
          toBase64(file).then((base64) => ({
            url: base64,
            isMain: false,
          }))
        )
      );
    }

    const payload = {
      ...roomData,
      images: images.length > 0 ? images : roomData.images,
    };

    const response = await axios.put(`${API_URL}/rooms/${id}`, payload, {
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    handleError("cập nhật phòng", error);
    throw error;
  }
};

// ✅ Xóa phòng
export const deleteRoom = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/rooms/${id}`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    handleError("xóa phòng", error);
    throw error;
  }
};

// Helper: chuyển file sang base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

// Helper: Xử lý lỗi chung
const handleError = (action, error) => {
  console.error(`❌ Có lỗi xảy ra khi ${action}:`, error);
  if (error.response) {
    console.error("📌 Chi tiết từ server:", error.response.data);
  } else if (error.request) {
    console.error("📌 Không nhận được phản hồi từ server:", error.request);
  } else {
    console.error("📌 Lỗi cấu hình:", error.message);
  }
};
