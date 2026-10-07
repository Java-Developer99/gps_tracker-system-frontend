import api from "../api/axios";

export const getVehicles = async () => {
    const response = await api.get("/api/vehicle/");
    return response.data;
};

export const getVehicleById = async (id) => {
    const response = await api.get(`/api/vehicle/${id}`);
    return response.data;
};

export const addVehicle = async (vehicleData) => {
    const response = await api.post(
        "/api/vehicle/add",
        vehicleData
    );

    return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
    const response = await api.put(
        `/api/vehicle/edit/${id}`,
        vehicleData
    );

    return response.data;
};