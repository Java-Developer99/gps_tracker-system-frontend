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
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { getVehicleById } from "../../services/vehicleService";

import "../../css/VehicleView.css";

const VehicleView = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
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
    }, [id]);

    const handleBack = () => {
        navigate("/vehicles");
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

                <button
                    type="button"
                    className="sf-vehicle-view-edit-button"
                    onClick={handleEdit}
                >
                    <FiEdit2 size={16} />
                    Edit Vehicle
                </button>
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

                        <div className="sf-vehicle-view-detail-row">
                            <span>
                                <FiHash size={13} />
                                Vehicle ID
                            </span>

                            <strong className="sf-vehicle-view-id">
                                {vehicle._id}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleView;