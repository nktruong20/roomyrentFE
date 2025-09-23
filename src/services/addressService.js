import axios from "axios";

// Base URL từ .env (ví dụ: http://localhost:3009)
// addressService.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3009/api";

// Sửa lại endpoint
export const getProvinces = async () => {
  const res = await axios.get(`${API_URL}/address/provinces`);
  return res.data;
};

export const getDistricts = async (provinceCode) => {
  const res = await axios.get(`${API_URL}/address/districts/${provinceCode}`);
  return res.data;
};

export const getWards = async (districtCode) => {
  const res = await axios.get(`${API_URL}/address/wards/${districtCode}`);
  return res.data;
};
