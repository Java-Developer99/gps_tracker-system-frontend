import api from "../api/axios";

export const getDevices = async () => {
    const response = await api.get("/api/device/");
    return response.data;
};

export const addDevice = async (deviceData) => {
    const response = await api.post("/api/device/add", deviceData);
    return response.data;
};

export const updateDevice = async (id, deviceData) => {
    const response = await api.put(
        `/api/device/edit/${id}`,
        deviceData
    );

    return response.data;
};

export const getDeviceById = async (id) => {
    const response = await api.get(`/api/device/${id}`);
    return response.data;
};

export const getManufacturers = async () => {
    const response = await api.get("/api/manufacturer/");
    return response.data;
};