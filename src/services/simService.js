import api from "../api/axios";

export const getSims = async () => {
    const response = await api.get("/api/sim/");
    return response.data;
};

export const getSimById = async (id) => {
    const response = await api.get(`/api/sim/${id}`);
    return response.data;
};

export const addSim = async (simData) => {
    const response = await api.post("/api/sim/add", simData);
    return response.data;
};

export const updateSim = async (id, simData) => {
    const response = await api.put(`/api/sim/edit/${id}`, simData);
    return response.data;
};