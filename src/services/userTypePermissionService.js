
import api from "../api/axios";

export const getUserTypes = async () => {
  const response = await api.get("/api/usertype/");
  return response.data;
};

export const getFunctions = async () => {
  const response = await api.get("/api/function/");
  return response.data;
};

export const getUserTypePermissions = async (userTypeId) => {
  const response = await api.get(
    `/api/usertypepermission/usertype/${userTypeId}`
  );
  return response.data;
};

export const addUserTypePermission = async (permissionData) => {
  const response = await api.post(
    "/api/usertypepermission/add",
    permissionData
  );
  return response.data;
};

export const updateUserTypePermission = async (id, permissionData) => {
  const response = await api.put(
    `/api/usertypepermission/edit/${id}`,
    permissionData
  );
  return response.data;
};
