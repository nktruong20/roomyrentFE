import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Helper: lấy token từ localStorage/sessionStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ================== THÊM YÊU THÍCH ==================
export const addFavourite = async (roomId) => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await axios.post(
      `${API_URL}/favourites`,
      { room_id: roomId },   // ✅ đảm bảo gửi room_id
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi thêm vào yêu thích:", err.response?.data || err.message);
    throw err.response?.data || "Lỗi thêm yêu thích";
  }
};


// ================== LẤY DANH SÁCH YÊU THÍCH CỦA USER (từ token) ==================
export const getFavouritesByUser = async () => {
  try {
    const res = await axios.get(`${API_URL}/favourites/me`, getAuthHeaders());
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách yêu thích:", err.response?.data || err.message);
    throw err.response?.data || "Lỗi lấy danh sách yêu thích";
  }
};

// ================== XÓA YÊU THÍCH ==================
export const removeFavourite = async (favouriteId) => {
  try {
    const res = await axios.delete(
      `${API_URL}/favourites/${favouriteId}`,
      getAuthHeaders()
    );
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi xóa yêu thích:", err.response?.data || err.message);
    throw err.response?.data || "Lỗi xóa yêu thích";
  }
};
