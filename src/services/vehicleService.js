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

// Get devices available for a vehicle
export const getAvailableDevices = async (vehicleId, search = "") => {
    const response = await api.get(
        `/api/vehicle/${vehicleId}/available-devices`,
        {
            params: { search }
        }
    );

    return response.data;
};

// Associate a device with a vehicle
export const associateDevice = async (vehicleId, deviceId) => {
    const response = await api.post(
        `/api/vehicle/${vehicleId}/associate-device`,
        { deviceId }
    );

    return response.data;
};

// Remove device association from a vehicle
export const disassociateDevice = async (vehicleId) => {
    const response = await api.delete(
        `/api/vehicle/${vehicleId}/disassociate-device`
    );

    return response.data;
};

// Get SIM cards available for a vehicle
export const getAvailableSims = async (vehicleId, search = "") => {
    const response = await api.get(
        `/api/vehicle/${vehicleId}/available-sims`,
        {
            params: { search }
        }
    );

    return response.data;
};

// Associate a SIM card with a vehicle
export const associateSim = async (vehicleId, simId) => {
    const response = await api.post(
        `/api/vehicle/${vehicleId}/associate-sim`,
        { simId }
    );

    return response.data;
};

// Remove SIM association from a vehicle
export const disassociateSim = async (vehicleId) => {
    const response = await api.delete(
        `/api/vehicle/${vehicleId}/disassociate-sim`
    );

    return response.data;
};