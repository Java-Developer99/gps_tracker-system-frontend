import api from "../api/axios";

export const getDealers = async () => {
  const response = await api.get("/api/dealer/");
  return response.data;
};

export const getDealerById = async (id) => {
  const response = await api.get(`/api/dealer/${id}`);
  return response.data;
};

export const addDealer = async (dealerData) => {
  const response = await api.post("/api/dealer/add", dealerData);
  return response.data;
};

export const updateDealer = async (id, dealerData) => {
  const response = await api.put(`/api/dealer/edit/${id}`, dealerData);
  return response.data;
};