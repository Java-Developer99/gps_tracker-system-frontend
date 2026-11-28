
import api from "../api/axios";

export const getUserTypes = async () => {
    const response = await api.get("/api/usertype/");
    return response.data;
};

export const getUserTypeById = async (id) => {
    const response = await api.get(`/api/usertype/${id}`);
    return response.data;
};
