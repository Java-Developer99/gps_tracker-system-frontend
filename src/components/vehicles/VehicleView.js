import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiEdit2,
    FiTruck,
    FiMapPin,
    FiCalendar,
    FiClock,
    FiHash,
    FiActivity,
    FiLock,
    FiUnlock,
    FiShield,
    FiCpu,
    FiCreditCard,
    FiPlus,
    FiX,
    FiTrash2,
    FiSearch,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { usePermission } from "../../context/PermissionContext";
import "../../css/AccessDenied.css";
import {
    getVehicleById,
    getAvailableDevices,
    associateDevice,
    disassociateDevice,
    getAvailableSims,
    associateSim,
    disassociateSim,
} from "../../services/vehicleService";

import "../../css/VehicleView.css";

const VehicleView = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        hasPermission,
        loading: permissionsLoading
    } = usePermission();

    const canViewVehicles = hasPermission("Vehicle", "canView");
    const canEditVehicles = hasPermission("Vehicle", "canEdit");

    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // Device and SIM mapping states
    const [mappingType, setMappingType] = useState("");
    const [mappingOptions, setMappingOptions] = useState([]);
    const [mappingSearch, setMappingSearch] = useState("");
    const [mappingLoading, setMappingLoading] = useState(false);
    const [mappingSaving, setMappingSaving] = useState(false);
    const [mappingError, setMappingError] = useState("");
    const [mappingMessage, setMappingMessage] = useState("");

    useEffect(() => {

        if (permissionsLoading || !canViewVehicles) {
            return;
        }
        let mounted = true;

        const fetchVehicle = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getVehicleById(id);

                if (mounted) {
                    setVehicle(data);
                }
            } catch (err) {
                console.error(
                    "Error fetching vehicle:",
                    err
                );

                if (mounted) {
                    setError(
                        err?.response?.data?.message ||
                        "Unable to load vehicle details."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchVehicle();

        return () => {
            mounted = false;
        };
    }, [id, permissionsLoading, canViewVehicles]);

    const handleBack = () => {
        navigate("/vehicles");
    };

    // Refresh vehicle details after mapping changes
    const refreshVehicleDetails = async () => {
        const data = await getVehicleById(id);
        setVehicle(data);
    };

    // Load available devices or SIM cards
    const loadMappingOptions = async (type, search = "") => {
        try {
            setMappingLoading(true);
            setMappingError("");
            setMappingOptions([]);

            if (type === "device") {
                const data = await getAvailableDevices(id, search);

                setMappingOptions(
                    Array.isArray(data) ? data : []
                );
            } else if (type === "sim") {
                const data = await getAvailableSims(id, search);

                setMappingOptions(
                    Array.isArray(data?.sims) ? data.sims : []
                );
            }
        } catch (err) {
            setMappingError(
                err?.response?.data?.message ||
                `Unable to load available ${type === "device" ? "devices" : "SIM cards"}.`
            );
        } finally {
            setMappingLoading(false);
        }
    };

    // Open device or SIM selection
    const openMappingModal = async (type) => {
        setMappingType(type);
        setMappingSearch("");
        setMappingMessage("");
        setMappingError("");

        await loadMappingOptions(type, "");
    };

    // Search available devices or SIM cards
    const handleMappingSearch = async (value) => {
        setMappingSearch(value);
        await loadMappingOptions(mappingType, value);
    };

    // Associate selected device or SIM
    const handleAssociate = async (itemId) => {
        try {
            setMappingSaving(true);
            setMappingError("");
            setMappingMessage("");

            if (mappingType === "device") {
                await associateDevice(id, itemId);
            } else if (mappingType === "sim") {
                await associateSim(id, itemId);
            }

            await refreshVehicleDetails();

            setMappingMessage(
                mappingType === "device"
                    ? "Device associated successfully."
                    : "SIM associated successfully."
            );

            setMappingType("");
            setMappingOptions([]);
            setMappingSearch("");
        } catch (err) {
            setMappingError(
                err?.response?.data?.message ||
                "Unable to complete the association."
            );
        } finally {
            setMappingSaving(false);
        }
    };

    // Remove an existing device or SIM association
    const handleDisassociate = async (type) => {
        const itemName = type === "device" ? "device" : "SIM";

        if (!window.confirm(`Are you sure you want to remove this ${itemName} mapping?`)) {
            return;
        }

        try {
            setMappingSaving(true);
            setMappingError("");
            setMappingMessage("");

            if (type === "device") {
                await disassociateDevice(id);
            } else {
                await disassociateSim(id);
            }

            await refreshVehicleDetails();

            setMappingMessage(
                `${type === "device" ? "Device" : "SIM"} mapping removed successfully.`
            );
        } catch (err) {
            setMappingError(
                err?.response?.data?.message ||
                `Unable to remove ${itemName} mapping.`
            );
        } finally {
            setMappingSaving(false);
        }
    };

    const handleEdit = () => {
        navigate(`/vehicles/edit/${id}`);
    };

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDateOnly = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatOdometer = (value) => {
        const number = Number(value);

        if (Number.isNaN(number)) {
            return "0 km";
        }

        return `${number.toLocaleString("en-IN")} km`;
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

    if (!canViewVehicles) {
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
                        You don't have permission to view vehicle details.
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
                        Back to Vehicles
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
            <div className="sf-vehicle-view-page">
                <div className="sf-vehicle-view-loading">
                    <div className="sf-vehicle-view-spinner"></div>
                    <p>Loading vehicle...</p>
                </div>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="sf-vehicle-view-page">
                <div className="sf-vehicle-view-error-card">
                    <div className="sf-vehicle-view-error-icon">
                        <FiTruck size={25} />
                    </div>

                    <h2>Unable to load vehicle</h2>

                    <p>
                        {error ||
                            "Vehicle details could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        Back to Vehicles
                    </button>
                </div>
            </div>
        );
    }

    const branch =
        typeof vehicle.branchId === "object"
            ? vehicle.branchId
            : null;

    const vehicleType =
        typeof vehicle.vehicleTypeId === "object"
            ? vehicle.vehicleTypeId
            : null;

    const vehicleName =
        `${vehicle.make || ""} ${vehicle.model || ""
            }`.trim() || "Vehicle";

    const initial =
        vehicle.make?.charAt(0)?.toUpperCase() ||
        vehicle.regNo?.charAt(0)?.toUpperCase() ||
        "V";

    return (
        <div className="sf-vehicle-view-page">
            {/* PAGE HEADER */}
            <div className="sf-vehicle-view-page-header">
                <div className="sf-vehicle-view-heading">
                    <button
                        type="button"
                        className="sf-vehicle-view-back-button"
                        onClick={handleBack}
                    >
                        <FiArrowLeft size={18} />
                    </button>

                    <div>
                        <h1>Vehicle Details</h1>
                        <p>
                            View vehicle information and fleet assignment.
                        </p>
                    </div>
                </div>

                {canEditVehicles && (
                    <button
                        type="button"
                        className="sf-vehicle-view-edit-button"
                        onClick={handleEdit}
                    >
                        <FiEdit2 size={16} />
                        Edit Vehicle
                    </button>
                )}
            </div>

            {/* PROFILE */}
            <div className="sf-vehicle-view-profile-card">
                <div className="sf-vehicle-view-profile">
                    <div className="sf-vehicle-view-avatar">
                        {initial}
                    </div>

                    <div>
                        <h2>{vehicleName}</h2>

                        <p>
                            {vehicle.regNo || "No registration number"}
                        </p>
                    </div>
                </div>

                <div className="sf-vehicle-view-profile-status">
                    <span
                        className={`sf-vehicle-view-status-badge ${vehicle.active
                            ? "active"
                            : "inactive"
                            }`}
                    >
                        <span></span>

                        {vehicle.active
                            ? "Active"
                            : "Inactive"}
                    </span>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="sf-vehicle-view-grid">
                {/* BASIC INFORMATION */}
                <div className="sf-vehicle-view-card">
                    <div className="sf-vehicle-view-card-header">
                        <div className="sf-vehicle-view-card-icon">
                            <FiTruck size={17} />
                        </div>

                        <div>
                            <h3>Vehicle Information</h3>
                            <p>Basic vehicle details</p>
                        </div>
                    </div>

                    <div className="sf-vehicle-view-details">
                        <div className="sf-vehicle-view-detail-row">
                            <span>Registration Number</span>
                            <strong>
                                {vehicle.regNo || "—"}
                            </strong>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>Vehicle Type</span>
                            <strong>
                                {vehicleType?.vehicleType ||
                                    "—"}
                            </strong>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>Make</span>
                            <strong>
                                {vehicle.make || "—"}
                            </strong>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>Model</span>
                            <strong>
                                {vehicle.model || "—"}
                            </strong>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>Manufacturing Year</span>
                            <strong>
                                {vehicle.year || "—"}
                            </strong>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>Odometer</span>
                            <strong>
                                {formatOdometer(
                                    vehicle.odoMeter
                                )}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* BRANCH */}
                <div className="sf-vehicle-view-card">
                    <div className="sf-vehicle-view-card-header">
                        <div className="sf-vehicle-view-card-icon">
                            <FiMapPin size={17} />
                        </div>

                        <div>
                            <h3>Branch Assignment</h3>
                            <p>Vehicle fleet hierarchy</p>
                        </div>
                    </div>

                    <div className="sf-vehicle-view-details">
                        <div className="sf-vehicle-view-detail-row">
                            <span>Branch</span>
                            <strong>
                                {branch?.name || "—"}
                            </strong>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>Branch ID</span>
                            <strong className="sf-vehicle-view-id">
                                {branch?._id ||
                                    (typeof vehicle.branchId ===
                                        "string"
                                        ? vehicle.branchId
                                        : "—")}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* STATUS */}
                <div className="sf-vehicle-view-card">
                    <div className="sf-vehicle-view-card-header">
                        <div className="sf-vehicle-view-card-icon">
                            <FiActivity size={17} />
                        </div>

                        <div>
                            <h3>Vehicle Status</h3>
                            <p>Current vehicle settings</p>
                        </div>
                    </div>

                    <div className="sf-vehicle-view-details">
                        <div className="sf-vehicle-view-detail-row">
                            <span>Vehicle Status</span>

                            <span
                                className={`sf-vehicle-view-status-badge ${vehicle.active
                                    ? "active"
                                    : "inactive"
                                    }`}
                            >
                                <span></span>

                                {vehicle.active
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>Access</span>

                            <span
                                className={`sf-vehicle-view-access-badge ${vehicle.accessBlocked
                                    ? "blocked"
                                    : "allowed"
                                    }`}
                            >
                                {vehicle.accessBlocked ? (
                                    <>
                                        <FiLock size={13} />
                                        Blocked
                                    </>
                                ) : (
                                    <>
                                        <FiUnlock size={13} />
                                        Allowed
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>Expiry Date</span>
                            <strong>
                                {formatDateOnly(
                                    vehicle.expiryDate
                                )}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* RECORD INFORMATION */}
                <div className="sf-vehicle-view-card">
                    <div className="sf-vehicle-view-card-header">
                        <div className="sf-vehicle-view-card-icon">
                            <FiCalendar size={17} />
                        </div>

                        <div>
                            <h3>Record Information</h3>
                            <p>Vehicle record timestamps</p>
                        </div>
                    </div>

                    <div className="sf-vehicle-view-details">
                        <div className="sf-vehicle-view-detail-row">
                            <span>
                                <FiClock size={13} />
                                Created
                            </span>

                            <strong>
                                {formatDate(
                                    vehicle.createdAt
                                )}
                            </strong>
                        </div>

                        <div className="sf-vehicle-view-detail-row">
                            <span>
                                <FiClock size={13} />
                                Last Updated
                            </span>

                            <strong>
                                {formatDate(
                                    vehicle.updatedAt
                                )}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* DEVICE MAPPING */}
                <div className="sf-vehicle-mapping-card">
                    <div className="sf-vehicle-view-card-header">
                        <div className="sf-vehicle-view-card-icon">
                            <FiCpu size={17} />
                        </div>

                        <div>
                            <h3>Device Mapping</h3>
                            <p>GPS tracking device assigned to this vehicle</p>
                        </div>
                    </div>

                    <div className="sf-vehicle-mapping-content">
                        {vehicle.device ? (
                            <>
                                <div className="sf-vehicle-view-details">
                                    <div className="sf-vehicle-view-detail-row">
                                        <span>IMEI</span>
                                        <strong>
                                            {vehicle.device.imei ||
                                                vehicle.device.IMEI ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div className="sf-vehicle-view-detail-row">
                                        <span>Model Name</span>
                                        <strong>
                                            {vehicle.device.modelName || "—"}
                                        </strong>
                                    </div>

                                    <div className="sf-vehicle-view-detail-row">
                                        <span>Serial Number</span>
                                        <strong>
                                            {vehicle.device.serial_no || "—"}
                                        </strong>
                                    </div>
                                </div>

                            </>
                        ) : (
                            <div className="sf-vehicle-mapping-empty">
                                <p>No GPS device is currently assigned.</p>

                                {canEditVehicles && (
                                    <button
                                        type="button"
                                        className="sf-vehicle-mapping-button"
                                        onClick={() => openMappingModal("device")}
                                    >
                                        <FiPlus size={14} />
                                        Associate Device
                                    </button>
                                )}
                            </div>
                        )}


                        {canEditVehicles && vehicle.device && (
                            <div className="sf-vehicle-mapping-actions">
                                <button
                                    type="button"
                                    className="sf-vehicle-mapping-button danger"
                                    disabled={mappingSaving}
                                    onClick={() => handleDisassociate("device")}
                                >
                                    <FiTrash2 size={14} />
                                    Remove Device
                                </button>

                                <button
                                    type="button"
                                    className="sf-vehicle-mapping-button"
                                    disabled={mappingSaving}
                                    onClick={() => openMappingModal("device")}
                                >
                                    <FiEdit2 size={14} />
                                    Change Device
                                </button>
                            </div>
                        )}

                    </div>
                </div>

                {/* SIM MAPPING */}
                <div className="sf-vehicle-mapping-card">
                    <div className="sf-vehicle-view-card-header">
                        <div className="sf-vehicle-view-card-icon">
                            <FiCreditCard size={17} />
                        </div>

                        <div>
                            <h3>SIM Mapping</h3>
                            <p>SIM card assigned to this vehicle</p>
                        </div>
                    </div>

                    <div className="sf-vehicle-mapping-content">
                        {vehicle.sim ? (
                            <>
                                <div className="sf-vehicle-view-details">
                                    <div className="sf-vehicle-view-detail-row">
                                        <span>SIM Number</span>
                                        <strong>
                                            {vehicle.sim.simNo || "—"}
                                        </strong>
                                    </div>

                                    <div className="sf-vehicle-view-detail-row">
                                        <span>M2M Number</span>
                                        <strong>
                                            {vehicle.sim.m2mNo || "—"}
                                        </strong>
                                    </div>

                                    <div className="sf-vehicle-view-detail-row">
                                        <span>Provider</span>
                                        <strong>
                                            {vehicle.sim.provider || "—"}
                                        </strong>
                                    </div>
                                </div>

                                {canEditVehicles && (
                                    <div className="sf-vehicle-mapping-actions">
                                        <button
                                            type="button"
                                            className="sf-vehicle-mapping-button danger"
                                            disabled={mappingSaving}
                                            onClick={() => handleDisassociate("sim")}
                                        >
                                            <FiTrash2 size={14} />
                                            Remove SIM
                                        </button>

                                        <button
                                            type="button"
                                            className="sf-vehicle-mapping-button"
                                            onClick={() => openMappingModal("sim")}
                                        >
                                            <FiEdit2 size={14} />
                                            Change SIM
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="sf-vehicle-mapping-empty">
                                <p>No SIM card is currently assigned.</p>

                                {canEditVehicles && (
                                    <button
                                        type="button"
                                        className="sf-vehicle-mapping-button"
                                        onClick={() => openMappingModal("sim")}
                                    >
                                        <FiPlus size={14} />
                                        Associate SIM
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>


            {/* DEVICE / SIM SELECTION MODAL */}
            {mappingType && (
                <div
                    className="sf-vehicle-mapping-modal-overlay"
                    onClick={() => {
                        if (!mappingSaving) {
                            setMappingType("");
                            setMappingOptions([]);
                        }
                    }}
                >
                    <div
                        className="sf-vehicle-mapping-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px"
                        }}>
                            <h3>
                                Select {mappingType === "device" ? "Device" : "SIM Card"}
                            </h3>

                            <button
                                type="button"
                                className="sf-vehicle-mapping-button"
                                disabled={mappingSaving}
                                onClick={() => {
                                    setMappingType("");
                                    setMappingOptions([]);
                                }}
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        <p className="sf-vehicle-mapping-modal-description">
                            Choose an available {mappingType === "device" ? "GPS device" : "SIM card"} to assign to this vehicle.
                        </p>

                        <div style={{ position: "relative" }}>
                            <FiSearch
                                size={15}
                                style={{
                                    position: "absolute",
                                    left: "12px",
                                    top: "13px",
                                    color: "#94a3b8"
                                }}
                            />

                            <input
                                type="text"
                                className="sf-vehicle-mapping-search"
                                style={{ paddingLeft: "36px" }}
                                placeholder={
                                    mappingType === "device"
                                        ? "Search IMEI, model or serial number..."
                                        : "Search SIM number, M2M or provider..."
                                }
                                value={mappingSearch}
                                onChange={(e) => handleMappingSearch(e.target.value)}
                            />
                        </div>

                        {mappingLoading ? (
                            <p className="sf-vehicle-mapping-message">
                                Loading available options...
                            </p>
                        ) : mappingError ? (
                            <p className="sf-vehicle-mapping-error">
                                {mappingError}
                            </p>
                        ) : mappingOptions.length > 0 ? (
                            <div className="sf-vehicle-mapping-options">
                                {mappingOptions.map((item) => (
                                    <button
                                        type="button"
                                        key={item._id}
                                        className="sf-vehicle-mapping-option"
                                        disabled={mappingSaving}
                                        onClick={() => handleAssociate(item._id)}
                                    >
                                        {mappingType === "device" ? (
                                            <>
                                                <strong>
                                                    IMEI: {item.imei || item.IMEI || "—"}
                                                </strong>
                                                <span>
                                                    Model: {item.modelName || "—"} ·
                                                    Serial: {item.serial_no || "—"}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <strong>
                                                    SIM: {item.simNo || "—"}
                                                </strong>
                                                <span>
                                                    M2M: {item.m2mNo || "—"} ·
                                                    Provider: {item.provider || "—"}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="sf-vehicle-mapping-message">
                                No available {mappingType === "device" ? "devices" : "SIM cards"} found.
                            </p>
                        )}

                        {mappingSaving && (
                            <p className="sf-vehicle-mapping-message">
                                Saving association...
                            </p>
                        )}

                        <div className="sf-vehicle-mapping-modal-footer">
                            <button
                                type="button"
                                className="sf-vehicle-mapping-button"
                                disabled={mappingSaving}
                                onClick={() => {
                                    setMappingType("");
                                    setMappingOptions([]);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mappingMessage && (
                <p className="sf-vehicle-mapping-message">
                    {mappingMessage}
                </p>
            )}

            {mappingError && !mappingType && (
                <p className="sf-vehicle-mapping-error">
                    {mappingError}
                </p>
            )}

        </div>

    );
};

export default VehicleView;