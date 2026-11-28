
import React, { useEffect, useState } from "react";
import { FiShield, FiSave, FiRefreshCw } from "react-icons/fi";

import { getUsers } from "../../services/userService";

import {
  getFunctions,
  getUserPermissions,
  addUserPermission,
  updateUserPermission,
} from "../../services/userPermissionService";

import "../../css/UserPermission.css";

const permissionFields = [
  { key: "canAdd", label: "Add" },
  { key: "canEdit", label: "Edit" },
  { key: "canView", label: "View" },
  { key: "canDelete", label: "Delete" },
];

const defaultPermissions = {
  canAdd: false,
  canEdit: false,
  canView: false,
  canDelete: false,
};

const extractList = (data, possibleKeys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of possibleKeys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

const getId = (value) => {
  if (!value) return "";
  return String(value._id || value);
};

const UserPermission = () => {
  const [users, setUsers] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [permissionRows, setPermissionRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const [savingFunctionId, setSavingFunctionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load users and functions when the page opens.
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersResponse, functionsResponse] = await Promise.all([
          getUsers(),
          getFunctions(),
        ]);

        setUsers(
          extractList(usersResponse, ["users", "data"])
        );

        setFunctions(
          extractList(functionsResponse, ["functions", "data"])
        );
      } catch (err) {
        console.error("Error loading permission page:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load users and functions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load permissions whenever the selected user changes.
  useEffect(() => {
    if (!selectedUserId) {
      setPermissionRows([]);
      return;
    }

    let isMounted = true;

    const loadSelectedUserPermissions = async () => {
      try {
        setPermissionsLoading(true);
        setError("");
        setSuccess("");

        setPermissionRows([]);

        const response = await getUserPermissions(selectedUserId);

        if (!isMounted) return;

        const permissions = extractList(response, ["permissions", "data"]);

        const permissionMap = new Map();

        permissions.forEach((permission) => {
          permissionMap.set(
            getId(permission.functionId),
            permission
          );
        });

        const rows = functions.map((func) => {
          const existingPermission = permissionMap.get(
            getId(func._id)
          );

          const values = {
            canAdd: existingPermission?.canAdd ?? false,
            canEdit: existingPermission?.canEdit ?? false,
            canView: existingPermission?.canView ?? false,
            canDelete: existingPermission?.canDelete ?? false,
          };

          return {
            functionId: func._id,
            functionName: func.funName,
            functionUrl: func.funUrl || "",
            permissionId: existingPermission?._id || null,
            ...values,
            original: { ...values },
          };
        });

        setPermissionRows(rows);
      } catch (err) {
        console.error("Error loading user permissions:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Unable to load permissions for this user."
          );
        }
      } finally {
        if (isMounted) {
          setPermissionsLoading(false);
        }
      }
    };

    loadSelectedUserPermissions();

    return () => {
      isMounted = false;
    };
  }, [selectedUserId, functions]);

  // Check whether a particular function has unsaved changes.
  const isRowDirty = (row) => {
    return permissionFields.some(
      ({ key }) => row[key] !== row.original[key]
    );
  };

  // Update one permission checkbox.
  const handlePermissionChange = (functionId, field, value) => {
    setPermissionRows((previousRows) =>
      previousRows.map((row) =>
        row.functionId === functionId
          ? { ...row, [field]: value }
          : row
      )
    );

    setSuccess("");
    setError("");
  };

  // Save only the selected function's permission changes.
  const handleSavePermission = async (row) => {
    try {
      setSavingFunctionId(row.functionId);
      setError("");
      setSuccess("");

      const changedFields = {};

      permissionFields.forEach(({ key }) => {
        if (row[key] !== row.original[key]) {
          changedFields[key] = row[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        return;
      }

      let savedPermissionId = row.permissionId;

if (row.permissionId) {
  const response = await updateUserPermission(
    row.permissionId,
    changedFields
  );

  savedPermissionId =
    response.userPermission?._id || row.permissionId;
} else {
  const response = await addUserPermission({
    userId: selectedUserId,
    functionId: row.functionId,
    canAdd: row.canAdd,
    canEdit: row.canEdit,
    canView: row.canView,
    canDelete: row.canDelete,
  });

  savedPermissionId = response.userPermission?._id;
}

      // Update the original values after successful saving.
      setPermissionRows((previousRows) =>
        previousRows.map((currentRow) =>
          currentRow.functionId === row.functionId
            ? {
                ...currentRow,
                permissionId: currentRow.permissionId || savedPermissionId,
                original: {
                  canAdd: currentRow.canAdd,
                  canEdit: currentRow.canEdit,
                  canView: currentRow.canView,
                  canDelete: currentRow.canDelete,
                },
              }
            : currentRow
        )
      );

      setSuccess(
        `${row.functionName} permissions saved successfully.`
      );
    } catch (err) {
      console.error("Error saving permission:", err);

      setError(
        err.response?.data?.message ||
        `Unable to save ${row.functionName} permissions.`
      );
    } finally {
      setSavingFunctionId(null);
    }
  };

  const selectedUser = users.find(
    (user) => getId(user._id) === selectedUserId
  );

  const dirtyCount = permissionRows.filter(isRowDirty).length;

  return (
    <div className="sf-user-permission-page">

      {/* Page Header */}
      <div className="sf-user-permission-header">
        <div>
          <div className="sf-user-permission-heading">
            <div className="sf-user-permission-heading-icon">
              <FiShield />
            </div>

            <div>
              <h1>User Permissions</h1>
              <p>
                Manage individual user access and permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="sf-user-permission-loading">
          <div className="sf-user-permission-spinner"></div>
          <p>Loading users and functions...</p>
        </div>
      ) : (
        <>
          {/* User Selection */}
          <div className="sf-user-permission-selection-card">
            <div className="sf-user-permission-selection-heading">
              <div className="sf-user-permission-card-icon">
                <FiShield />
              </div>

              <div>
                <h3>Select User</h3>
                <p>
                  Choose a user whose permissions you want to manage.
                </p>
              </div>
            </div>

            <div className="sf-user-permission-select-wrapper">
              <label htmlFor="permission-user-select">
                User
              </label>

              <select
                id="permission-user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">
                  Select a user
                </option>

                {users.map((user) => (
                  <option
                    key={user._id}
                    value={user._id}
                  >
                    {user.name} ({user.username})
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <div className="sf-user-permission-selected-user">
                <div className="sf-user-permission-user-avatar">
                  {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <strong>{selectedUser.name}</strong>
                  <span>
                    {selectedUser.username}
                    {selectedUser.email
                      ? ` · ${selectedUser.email}`
                      : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="sf-user-permission-alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="sf-user-permission-alert success">
              {success}
            </div>
          )}

          {/* Permission Table */}
          {selectedUserId && (
            <div className="sf-user-permission-table-card">

              <div className="sf-user-permission-table-header">
                <div>
                  <h3>Configure Permissions</h3>
                  <p>
                    Manage access separately for each function.
                  </p>
                </div>

                {dirtyCount > 0 && (
                  <span className="sf-user-permission-unsaved">
                    {dirtyCount} unsaved
                  </span>
                )}
              </div>

              {permissionsLoading ? (
                <div className="sf-user-permission-loading">
                  <div className="sf-user-permission-spinner"></div>
                  <p>Loading user permissions...</p>
                </div>
              ) : permissionRows.length === 0 ? (
                <div className="sf-user-permission-empty">
                  No functions available.
                </div>
              ) : (
                <div className="sf-user-permission-table-wrapper">
                  <table className="sf-user-permission-table">
                    <thead>
                      <tr>
                        <th>Function</th>
                        {permissionFields.map((field) => (
                          <th key={field.key}>
                            {field.label}
                          </th>
                        ))}
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {permissionRows.map((row) => {
                        const dirty = isRowDirty(row);

                        return (
                          <tr key={row.functionId}>
                            <td>
                              <div className="sf-user-permission-function">
                                <strong>{row.functionName}</strong>

                                {row.functionUrl && (
                                  <span>{row.functionUrl}</span>
                                )}
                              </div>
                            </td>

                            {permissionFields.map((field) => (
                              <td key={field.key}>
                                <label className="sf-user-permission-toggle">
                                  <input
                                    type="checkbox"
                                    checked={row[field.key]}
                                    disabled={
                                      savingFunctionId === row.functionId
                                    }
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        row.functionId,
                                        field.key,
                                        e.target.checked
                                      )
                                    }
                                  />

                                  <span className="sf-user-permission-toggle-slider"></span>
                                </label>
                              </td>
                            ))}

                            <td>
                              <button
                                type="button"
                                className={`sf-user-permission-save-button ${
                                  dirty ? "dirty" : ""
                                }`}
                                disabled={
                                  !dirty ||
                                  savingFunctionId === row.functionId
                                }
                                onClick={() => handleSavePermission(row)}
                              >
                                {savingFunctionId === row.functionId ? (
                                  <>
                                    <FiRefreshCw className="sf-spin" />
                                    Saving
                                  </>
                                ) : (
                                  <>
                                    <FiSave />
                                    Save
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="sf-user-permission-footer">
                <span>
                  Changes are saved independently for each function.
                </span>
              </div>
            </div>
          )}

          {!selectedUserId && (
            <div className="sf-user-permission-empty-card">
              <div className="sf-user-permission-empty-icon">
                <FiShield />
              </div>

              <h3>Select a user to continue</h3>

              <p>
                Select a user from the dropdown to view and manage
                their permissions.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserPermission;
