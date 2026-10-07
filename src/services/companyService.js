import api from "../api/axios";

export const getCompanies = async () => {
    const response = await api.get("/api/company/");
    return response.data;
};

export const getCompanyById = async (id) => {
    const response = await api.get(`/api/company/${id}`);
    return response.data;
};

export const addCompany = async (companyData) => {
    const response = await api.post("/api/company/add", companyData);
    return response.data;
};

export const updateCompany = async (id, companyData) => {
    const response = await api.put(`/api/company/edit/${id}`, companyData);
    return response.data;
};