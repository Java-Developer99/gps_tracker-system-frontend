
import api from "../api/axios";

export const getUsers = async () => {
    const response = await api.get("/api/user/");
    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/api/user/${id}`);
    return response.data;
};

export const addUser = async (userData) => {
    const response = await api.post("/api/user/add", userData);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await api.put(`/api/user/edit/${id}`, userData);
    return response.data;
};

export const updateUserStatus = async (id, status) => {
    const response = await api.patch(
        `/api/user/${id}/status`,
        { status }
    );

    return response.data;
};

export const getUserPermissions = async (id) => {
    const response = await api.get(`/api/user/${id}/permissions`);
    return response.data;
};
