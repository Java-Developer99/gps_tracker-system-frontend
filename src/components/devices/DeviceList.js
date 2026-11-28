
import React, { useEffect, useMemo, useState } from "react";

import {
    FiSearch,
    FiRefreshCw,
    FiMoreVertical,
    FiEye,
    FiEdit2,
    FiCpu,
    FiShield,
    FiPlus
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { getDevices } from "../../services/deviceService";
import "../../css/BranchList.css";
import { usePermission } from "../../context/PermissionContext";

function DeviceList() {
    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading
    } = usePermission();

    const canViewDevices =
        !permissionsLoading && hasPermission("Device", "canView");

    const canEditDevices =
        !permissionsLoading && hasPermission("Device", "canEdit");

    const [devices, setDevices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchDevices = async (showRefreshLoader = false) => {
        try {
            setError("");

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getDevices();

            const normalizedDevices = Array.isArray(data)
                ? data.map((device) => {
                    const manufacturer = device.manufacturerId;

                    return {
                        id: device._id,
                        imei: device.imei || "",
                        modelName: device.modelName || "",
                        manufacturerName:
                            typeof manufacturer === "object"
                                ? manufacturer?.name || ""
                                : "",
                        port: device.port ?? "",
                        dualSim: device.dualSim,
                        status: device.status || "active",
                    };
                })
                : [];

            setDevices(normalizedDevices);

        } catch (err) {
            console.error("Error fetching devices:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load devices. Please try again."
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!permissionsLoading && canViewDevices) {
            fetchDevices();
        }
    }, [permissionsLoading, canViewDevices]);

    const filteredDevices = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return devices.filter((device) => {
            if (!search) return true;

            return (
                device.imei.toLowerCase().includes(search) ||
                device.modelName.toLowerCase().includes(search) ||
                device.manufacturerName.toLowerCase().includes(search) ||
                String(device.port).includes(search)
            );
        });
    }, [devices, searchTerm]);

    const handleRefresh = () => {
        setSearchTerm("");
        setOpenMenuId(null);
        fetchDevices(true);
    };

    const handleAddDevice=()=> {
        navigate("/device/add");
    }

    const handleView = (deviceId) => {
        navigate(`/device/${deviceId}`);
        setOpenMenuId(null);
    };

    const handleEdit = (deviceId) => {
        navigate(`/device/edit/${deviceId}`);
        setOpenMenuId(null);
    };

    if (permissionsLoading) {
        return (
            <div className="sf-branch-page">
                <div className="sf-branch-card">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        Checking permissions...
                    </div>
                </div>
            </div>
        );
    }

    if (!canViewDevices) {
        return (
            <div className="sf-branch-page">
                <div className="sf-branch-card">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <FiShield />
                        <h2>Access Denied</h2>
                        <p>You don't have permission to view Devices.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="sf-branch-page">
                <div className="sf-branch-page-header">
                    <div>
                        <h1>Devices</h1>
                        <p>Manage GPS tracking devices.</p>
                    </div>
                </div>

                <div className="sf-branch-card">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        Loading devices...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sf-branch-page">

            <div className="sf-branch-page-header">
                <div>
                    <h1>Devices</h1>
                    <p>Manage GPS tracking devices.</p>
                </div>

                    <button
                        className="sf-branch-add-button"
                        onClick={handleAddDevice}
                        >
                        <FiPlus />
                        <span>Add Device</span>
                    </button>

            </div>
            {error && (
                <div
                    className="sf-branch-error"
                    style={{ marginBottom: "16px" }}
                >
                    {error}
                </div>
            )}

            <div className="sf-branch-toolbar">
                <div className="sf-branch-search">
                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search IMEI, model, manufacturer or port..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    className="sf-branch-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh"
                >
                    <FiRefreshCw
                        className={
                            refreshing ? "sf-branch-refreshing" : ""
                        }
                    />

                    <span>Refresh</span>
                </button>
            </div>

            <div className="sf-branch-card">
                <div className="sf-branch-card-header">
                    <div>
                        <h2>All Devices</h2>
                        <span>{filteredDevices.length} devices</span>
                    </div>
                </div>

                {filteredDevices.length > 0 ? (
                    <div className="sf-branch-table-wrapper">
                        <table className="sf-branch-table">
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>IMEI</th>
                                    <th>Manufacturer</th>
                                    <th>Port</th>
                                    <th>Dual SIM</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredDevices.map((device, index) => (
                                    <tr
                                        key={device.id}
                                        className={
                                            openMenuId === device.id &&
                                            index >= filteredDevices.length - 2
                                                ? "sf-branch-menu-up"
                                                : ""
                                        }
                                    >
                                        <td>
                                            <div className="sf-branch-identity">
                                                <div className="sf-branch-avatar">
                                                    <FiCpu />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {device.modelName || "Unnamed Device"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{device.imei}</td>

                                        <td>
                                            {device.manufacturerName || "—"}
                                        </td>

                                        <td>{device.port}</td>

                                        <td>
                                            {device.dualSim ? "Yes" : "No"}
                                        </td>

                                        <td>
                                            <span
                                                className={`sf-dealer-status-badge ${
                                                    device.status?.toLowerCase() === "active"
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                <span className="sf-dealer-status-dot"></span>
                                                {device.status?.toLowerCase() === "active"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="sf-branch-actions-cell">
                                            <button
                                                className="sf-branch-menu-button"
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId === device.id
                                                            ? null
                                                            : device.id
                                                    )
                                                }
                                            >
                                                <FiMoreVertical />
                                            </button>

                                            {openMenuId === device.id && (
                                                <div className="sf-branch-action-menu">
                                                    <button
                                                        onClick={() =>
                                                            handleView(device.id)
                                                        }
                                                    >
                                                        <FiEye />
                                                        <span>View</span>
                                                    </button>

                                                    {canEditDevices && (
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(device.id)
                                                            }
                                                        >
                                                            <FiEdit2 />
                                                            <span>Edit</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="sf-branch-empty">
                        <div className="sf-branch-empty-icon">
                            <FiCpu />
                        </div>

                        <h3>No devices found</h3>
                        <p>Try changing your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DeviceList;
