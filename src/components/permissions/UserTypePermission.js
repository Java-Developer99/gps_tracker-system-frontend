
import React, { useEffect, useState } from "react";
import { FiShield, FiSave, FiRefreshCw } from "react-icons/fi";

import {
  getUserTypes,
  getFunctions,
  getUserTypePermissions,
  addUserTypePermission,
  updateUserTypePermission,
} from "../../services/userTypePermissionService";

import "../../css/UserTypePermission.css";

const permissionFields = [
  { key: "canAdd", label: "Add" },
  { key: "canEdit", label: "Edit" },
  { key: "canView", label: "View" },
  { key: "canDelete", label: "Delete" },
];

const extractList = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
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

const UserTypePermission = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [functions, setFunctions] = useState([]);

  const [selectedUserTypeId, setSelectedUserTypeId] = useState("");
  const [permissionRows, setPermissionRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [savingFunctionId, setSavingFunctionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load user types and functions.
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [userTypeResponse, functionResponse] =
          await Promise.all([
            getUserTypes(),
            getFunctions(),
          ]);

        setUserTypes(
          extractList(userTypeResponse, ["userTypes", "data"])
        );

        setFunctions(
          extractList(functionResponse, ["functions", "data"])
        );
      } catch (err) {
        console.error("Error loading user types and functions:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load user types and functions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load permissions whenever the selected user type changes.
  useEffect(() => {
    if (!selectedUserTypeId || functions.length === 0) {
      setPermissionRows([]);
      return;
    }

    let isMounted = true;

    const loadPermissions = async () => {
      try {
        setPermissionsLoading(true);
        setError("");
        setSuccess("");
        setPermissionRows([]);

        const response = await getUserTypePermissions(
          selectedUserTypeId
        );

        if (!isMounted) return;

        const permissions = extractList(response, [
          "permissions",
          "data",
        ]);

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
        console.error("Error loading user type permissions:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Unable to load permissions for this user type."
          );
        }
      } finally {
        if (isMounted) {
          setPermissionsLoading(false);
        }
      }
    };

    loadPermissions();

    return () => {
      isMounted = false;
    };
  }, [selectedUserTypeId, functions]);

  // Check whether a function row has unsaved changes.
  const isRowDirty = (row) =>
    permissionFields.some(
      ({ key }) => row[key] !== row.original[key]
    );

  // Change one permission switch.
  const handlePermissionChange = (functionId, field, value) => {
    setPermissionRows((previousRows) =>
      previousRows.map((row) =>
        row.functionId === functionId
          ? { ...row, [field]: value }
          : row
      )
    );

    setError("");
    setSuccess("");
  };

  // Save only the selected function's permission record.
  const handleSavePermission = async (row) => {
    const changedFields = {};

    permissionFields.forEach(({ key }) => {
      if (row[key] !== row.original[key]) {
        changedFields[key] = row[key];
      }
    });

    if (Object.keys(changedFields).length === 0) return;

    try {
      setSavingFunctionId(row.functionId);
      setError("");
      setSuccess("");

      let savedPermissionId = row.permissionId;

      if (row.permissionId) {
        const response = await updateUserTypePermission(
          row.permissionId,
          changedFields
        );

        savedPermissionId =
          response.utp?._id || row.permissionId;
      } else {
        const response = await addUserTypePermission({
          userTypeId: selectedUserTypeId,
          functionId: row.functionId,
          canAdd: row.canAdd,
          canEdit: row.canEdit,
          canView: row.canView,
          canDelete: row.canDelete,
        });

        savedPermissionId = response.utp?._id || null;
      }

      setPermissionRows((previousRows) =>
        previousRows.map((currentRow) =>
          currentRow.functionId === row.functionId
            ? {
                ...currentRow,
                permissionId: savedPermissionId,
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
      console.error("Error saving user type permission:", err);

      setError(
        err.response?.data?.message ||
        `Unable to save ${row.functionName} permissions.`
      );
    } finally {
      setSavingFunctionId(null);
    }
  };

  const selectedUserType = userTypes.find(
    (type) => getId(type._id) === selectedUserTypeId
  );

  const dirtyCount = permissionRows.filter(isRowDirty).length;

  return (
    <div className="sf-user-type-permission-page">

      {/* Page Header */}
      <div className="sf-user-type-permission-header">
        <div className="sf-user-type-permission-heading">
          <div className="sf-user-type-permission-heading-icon">
            <FiShield />
          </div>

          <div>
            <h1>User Type Permissions</h1>
            <p>
              Manage permissions based on user roles
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="sf-user-type-permission-loading">
          <div className="sf-user-type-permission-spinner"></div>
          <p>Loading user types and functions...</p>
        </div>
      ) : (
        <>
          {/* User Type Selection */}
          <div className="sf-user-type-permission-selection-card">
            <div className="sf-user-type-permission-selection-heading">
              <div className="sf-user-type-permission-card-icon">
                <FiShield />
              </div>

              <div>
                <h3>Select User Type</h3>
                <p>
                  Choose a role to manage its permissions.
                </p>
              </div>
            </div>

            <div className="sf-user-type-permission-select-wrapper">
              <label htmlFor="user-type-select">
                User Type
              </label>

              <select
                id="user-type-select"
                value={selectedUserTypeId}
                onChange={(e) =>
                  setSelectedUserTypeId(e.target.value)
                }
              >
                <option value="">Select a user type</option>

                {userTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedUserType && (
              <div className="sf-user-type-permission-selected">
                <div className="sf-user-type-permission-role-avatar">
                  {selectedUserType.name?.charAt(0)?.toUpperCase() || "R"}
                </div>

                <div>
                  <strong>{selectedUserType.name}</strong>
                  <span>Selected user role</span>
                </div>
              </div>
            )}
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="sf-user-type-permission-alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="sf-user-type-permission-alert success">
              {success}
            </div>
          )}

          {/* Permissions Table */}
          {selectedUserTypeId && (
            <div className="sf-user-type-permission-table-card">
              <div className="sf-user-type-permission-table-header">
                <div>
                  <h3>Configure Permissions</h3>
                  <p>
                    Changes are saved independently for each function.
                  </p>
                </div>

                {dirtyCount > 0 && (
                  <span className="sf-user-type-permission-unsaved">
                    {dirtyCount} unsaved
                  </span>
                )}
              </div>

              {permissionsLoading ? (
                <div className="sf-user-type-permission-loading">
                  <div className="sf-user-type-permission-spinner"></div>
                  <p>Loading permissions...</p>
                </div>
              ) : permissionRows.length === 0 ? (
                <div className="sf-user-type-permission-empty">
                  No functions available.
                </div>
              ) : (
                <div className="sf-user-type-permission-table-wrapper">
                  <table className="sf-user-type-permission-table">
                    <thead>
                      <tr>
                        <th>Function</th>

                        {permissionFields.map((field) => (
                          <th key={field.key}>{field.label}</th>
                        ))}

                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {permissionRows.map((row) => {
                        const dirty = isRowDirty(row);
                        const saving =
                          savingFunctionId === row.functionId;

                        return (
                          <tr key={row.functionId}>
                            <td>
                              <div className="sf-user-type-permission-function">
                                <strong>{row.functionName}</strong>

                                {row.functionUrl && (
                                  <span>{row.functionUrl}</span>
                                )}
                              </div>
                            </td>

                            {permissionFields.map((field) => (
                              <td key={field.key}>
                                <label className="sf-user-type-permission-toggle">
                                  <input
                                    type="checkbox"
                                    checked={row[field.key]}
                                    disabled={saving}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        row.functionId,
                                        field.key,
                                        e.target.checked
                                      )
                                    }
                                  />

                                  <span className="sf-user-type-permission-toggle-slider"></span>
                                </label>
                              </td>
                            ))}

                            <td>
                              <button
                                type="button"
                                className={`sf-user-type-permission-save-button ${
                                  dirty ? "dirty" : ""
                                }`}
                                disabled={!dirty || saving}
                                onClick={() =>
                                  handleSavePermission(row)
                                }
                              >
                                {saving ? (
                                  <>
                                    <FiRefreshCw className="sf-utp-spin" />
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

              <div className="sf-user-type-permission-footer">
                Each function has its own independent Save action.
              </div>
            </div>
          )}

          {!selectedUserTypeId && (
            <div className="sf-user-type-permission-empty-card">
              <div className="sf-user-type-permission-empty-icon">
                <FiShield />
              </div>

              <h3>Select a user type to continue</h3>

              <p>
                Choose a role from the dropdown to view and manage
                its permissions.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserTypePermission;
