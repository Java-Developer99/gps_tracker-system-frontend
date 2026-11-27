
import React, { useEffect, useState } from "react";

import {
    FiArrowLeft,
    FiEdit2,
    FiCalendar,
    FiCpu,
    FiShield,
    FiServer,
    FiHash,
    FiTruck,
} from "react-icons/fi";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { getDeviceById } from "../../services/deviceService";
import "../../css/BranchView.css";
import { usePermission } from "../../context/PermissionContext";
import "../../css/AccessDenied.css";

function DeviceView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading
    } = usePermission();

    const canViewDevices =
        !permissionsLoading && hasPermission("Device", "canView");

    const canEditDevices =
        !permissionsLoading && hasPermission("Device", "canEdit");

    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (permissionsLoading || !canViewDevices) {
            return;
        }

        let mounted = true;

        const fetchDevice = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getDeviceById(id);

                if (mounted) {
                    setDevice(data.device || data);
                }
            } catch (err) {
                console.error("Error loading device:", err);

                if (mounted) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load device details."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchDevice();

        return () => {
            mounted = false;
        };
    }, [id, permissionsLoading, canViewDevices]);

    const handleBack = () => {
        navigate("/device");
    };

    const handleEdit = () => {
        navigate(`/device/edit/${id}`);
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (permissionsLoading) {
        return (
            <div className="sf-access-denied-page">
                <div className="sf-access-denied-card">
                    <p>Checking permissions...</p>
                </div>
            </div>
        );
    }

    if (!canViewDevices) {
        return (
            <div className="sf-access-denied-page">
                <div className="sf-access-denied-card">

                    <div className="sf-access-denied-icon">
                        <FiShield />
                    </div>

                    <div className="sf-access-denied-label">
                        ACCESS RESTRICTED
                    </div>

                    <h1>Access Denied</h1>

                    <p>
                        You don't have permission to view Devices.
                        <br />
                        Please contact your administrator if you believe you
                        should have access to this feature.
                    </p>

                    <div className="sf-access-denied-divider"></div>

                    <button
                        className="sf-access-denied-button"
                        onClick={handleBack}
                    >
                        <FiArrowLeft />
                        Back to Devices
                    </button>

                    <span className="sf-access-denied-footer">
                        SyncFleet · Access Control
                    </span>

                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="sf-branch-view-page">
                <div className="sf-branch-view-loading">
                    <div className="sf-branch-view-spinner" />
                    <span>Loading device details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sf-branch-view-page">

                <div className="sf-branch-view-page-header">

                    <button
                        className="sf-branch-view-back-button"
                        onClick={handleBack}
                        type="button"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Device Details</h1>
                        <p>View device information.</p>
                    </div>

                </div>

                <div className="sf-branch-view-error-card">
                    <div className="sf-branch-view-error-icon">!</div>

                    <h2>Unable to load device</h2>

                    <p>{error}</p>

                    <button type="button" onClick={handleBack}>
                        Back to Devices
                    </button>
                </div>

            </div>
        );
    }

    if (!device) {
        return null;
    }

    const deviceName = device.modelName?.trim() || "Unnamed Device";

    const manufacturer =
        typeof device.manufacturerId === "object"
            ? device.manufacturerId
            : null;

    return (
        <div className="sf-branch-view-page">

            {/* HEADER */}

            <div className="sf-branch-view-page-header">

                <div className="sf-branch-view-heading">

                    <button
                        className="sf-branch-view-back-button"
                        onClick={handleBack}
                        type="button"
                        title="Back to Devices"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Device Details</h1>
                        <p>View device information.</p>
                    </div>

                </div>

                {canEditDevices && (
                    <button
                        className="sf-branch-view-edit-button"
                        onClick={handleEdit}
                        type="button"
                    >
                        <FiEdit2 />
                        <span>Edit Device</span>
                    </button>
                )}

            </div>

            {/* PROFILE */}

            <div className="sf-branch-view-profile-card">

                <div className="sf-branch-view-profile-avatar">
                    <FiCpu />
                </div>

                <div>
                    <h2>{deviceName}</h2>
                    <span>GPS Tracking Device</span>
                </div>

            </div>

            {/* INFORMATION */}

            <div className="sf-branch-view-grid">

                {/* DEVICE INFORMATION */}

                <div className="sf-branch-view-card">

                    <div className="sf-branch-view-card-header">

                        <div className="sf-branch-view-card-icon">
                            <FiCpu />
                        </div>

                        <div>
                            <h3>Device Information</h3>
                            <p>Device identification details</p>
                        </div>

                    </div>

                    <div className="sf-branch-view-details">

                        <div className="sf-branch-view-detail-row">
                            <span>Model Name</span>
                            <strong>{device.modelName || "—"}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>IMEI</span>
                            <strong>{device.imei || "—"}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>Serial Number</span>
                            <strong>{device.serial_no || "—"}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>Manufacturer</span>
                            <strong>{manufacturer?.name || "—"}</strong>
                        </div>

                    </div>

                </div>

                {/* CONFIGURATION */}

                <div className="sf-branch-view-card">

                    <div className="sf-branch-view-card-header">

                        <div className="sf-branch-view-card-icon">
                            <FiServer />
                        </div>

                        <div>
                            <h3>Device Configuration</h3>
                            <p>Communication and hardware settings</p>
                        </div>

                    </div>

                    <div className="sf-branch-view-details">

                        <div className="sf-branch-view-detail-row">
                            <span>Port</span>
                            <strong>{device.port ?? "—"}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>Dual SIM</span>
                            <strong>{device.dualSim ? "Yes" : "No"}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>AIS-140</span>
                            <strong>{device.ais140 ? "Yes" : "No"}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>Status</span>
                            <strong>
                                {device.status === "inactive" ? "Inactive" : "Active"}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* PURCHASE INFORMATION */}

                <div className="sf-branch-view-card">

                    <div className="sf-branch-view-card-header">

                        <div className="sf-branch-view-card-icon">
                            <FiTruck />
                        </div>

                        <div>
                            <h3>Purchase Information</h3>
                            <p>Vendor and invoice details</p>
                        </div>

                    </div>

                    <div className="sf-branch-view-details">

                        <div className="sf-branch-view-detail-row">
                            <span>Invoice Number</span>
                            <strong>{device.invoiceNo || "—"}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>Vendor Name</span>
                            <strong>{device.vendorName || "—"}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>Purchase Date</span>
                            <strong>{formatDate(device.purchaseDate)}</strong>
                        </div>

                    </div>

                </div>

                {/* RECORD INFORMATION */}

                <div className="sf-branch-view-card">

                    <div className="sf-branch-view-card-header">

                        <div className="sf-branch-view-card-icon">
                            <FiCalendar />
                        </div>

                        <div>
                            <h3>Record Information</h3>
                            <p>Device record history</p>
                        </div>

                    </div>

                    <div className="sf-branch-view-details">

                        <div className="sf-branch-view-detail-row">
                            <span>Created</span>
                            <strong>{formatDate(device.createdAt)}</strong>
                        </div>

                        <div className="sf-branch-view-detail-row">
                            <span>Last Updated</span>
                            <strong>{formatDate(device.updatedAt)}</strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default DeviceView;
