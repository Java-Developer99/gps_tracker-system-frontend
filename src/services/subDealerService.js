import api from "../api/axios";

export const getSubDealers = async () => {
  const response = await api.get("/api/subdealer/");
  return response.data;
};

export const getSubDealerById = async (id) => {
  const response = await api.get(`/api/subdealer/${id}`);
  return response.data;
};

export const addSubDealer = async (subDealerData) => {
  const response = await api.post("/api/subdealer/add", subDealerData);
  return response.data;
};

export const updateSubDealer = async (id, subDealerData) => {
  const response = await api.put(`/api/subdealer/edit/${id}`, subDealerData);
  return response.data;
};