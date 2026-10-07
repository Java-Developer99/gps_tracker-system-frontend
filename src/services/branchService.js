import api from "../api/axios";

export const getBranches = async () => {
    const response = await api.get("/api/branch/");
    return response.data;
};

export const getBranchById = async (id) => {
    const response = await api.get(`/api/branch/${id}`);
    return response.data;
};

export const addBranch = async (branchData) => {
    const response = await api.post("/api/branch/add", branchData);
    return response.data;
};

export const updateBranch = async (id, branchData) => {
    const response = await api.put(`/api/branch/edit/${id}`, branchData);
    return response.data;
};