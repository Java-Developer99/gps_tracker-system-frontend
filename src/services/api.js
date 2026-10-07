import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://gpstrackersystem-production-3e30.up.railway.app";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export default api;
