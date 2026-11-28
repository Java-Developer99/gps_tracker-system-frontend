
import api from "../api/axios";

export const getFunctions = async () => {
  const response = await api.get("/api/function/");
  return response.data;
};

export const getUserPermissions = async (userId) => {
  const response = await api.get(`/api/userpermission/user/${userId}`);
  return response.data;
};

export const addUserPermission = async (permissionData) => {
  const response = await api.post(
    "/api/userpermission/add",
    permissionData
  );
  return response.data;
};

export const updateUserPermission = async (id, permissionData) => {
  const response = await api.put(
    `/api/userpermission/edit/${id}`,
    permissionData
  );
  return response.data;
};
