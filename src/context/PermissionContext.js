
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  import api from "../api/axios";
  
  const PermissionContext = createContext(null);
  
  // Decode JWT payload to obtain the authenticated user ID.
  // The backend remains responsible for verifying the token.
  const getUserIdFromToken = (token) => {
    try {
      const payload = token.split(".")[1];
  
      const base64 = payload
        .replace(/-/g, "+")
        .replace(/_/g, "/");
  
      const decoded = JSON.parse(atob(base64));
  
      return decoded.userId || null;
    } catch (error) {
      console.error("Unable to decode authentication token:", error);
      return null;
    }
  };
  
  export function PermissionProvider({ children }) {
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const refreshPermissions = useCallback(async () => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        setPermissions({});
        setLoading(false);
        return;
      }
  
      const userId = getUserIdFromToken(token);
  
      if (!userId) {
        setPermissions({});
        setError("Unable to identify the logged-in user.");
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        setError(null);
  
        const response = await api.get(
          `/api/userpermission/user/${userId}`
        );
  
        const permissionMap = {};
  
        response.data.forEach((item) => {
          const functionName = item.functionId?.funName;
  
          if (!functionName) return;
  
          permissionMap[functionName] = {
            canAdd: Boolean(item.canAdd),
            canEdit: Boolean(item.canEdit),
            canView: Boolean(item.canView),
            canDelete: Boolean(item.canDelete),
          };
        });
  
        setPermissions(permissionMap);
      } catch (err) {
        console.error("Permission loading failed:", err);
  
        setPermissions({});
        setError(
          err.response?.data?.message ||
          "Unable to load user permissions."
        );
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      refreshPermissions();
  
      // Refresh permissions after login or clear them after logout.
      window.addEventListener("authChanged", refreshPermissions);
  
      return () => {
        window.removeEventListener("authChanged", refreshPermissions);
      };
    }, [refreshPermissions]);
  
    const hasPermission = useCallback(
      (functionName, action = "canView") => {
        return Boolean(permissions[functionName]?.[action]);
      },
      [permissions]
    );
  
    return (
      <PermissionContext.Provider
        value={{
          permissions,
          loading,
          error,
          hasPermission,
          refreshPermissions,
        }}
      >
        {children}
      </PermissionContext.Provider>
    );
  }
  
  export function usePermission() {
    const context = useContext(PermissionContext);
  
    if (!context) {
      throw new Error(
        "usePermission must be used inside PermissionProvider"
      );
    }
  
    return context;
  }
  