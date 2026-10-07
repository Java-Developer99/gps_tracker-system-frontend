import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiMoreVertical,
    FiEye,
    FiEdit2,
    FiTruck,
    FiLock,
    FiUnlock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { getVehicles } from "../../services/vehicleService";
import "../../css/VehicleList.css";

const VehicleList = () => {
    const navigate = useNavigate();

    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [openMenuId, setOpenMenuId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchVehicles = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getVehicles();

            const normalizedVehicles = Array.isArray(data)
                ? data.map((vehicle) => ({
                    id: vehicle._id,
                    branchId:
                        typeof vehicle.branchId === "object"
                            ? vehicle.branchId?._id
                            : vehicle.branchId,

                    branchName:
                        typeof vehicle.branchId === "object"
                            ? vehicle.branchId?.name || ""
                            : "",

                    vehicleTypeId:
                        typeof vehicle.vehicleTypeId === "object"
                            ? vehicle.vehicleTypeId?._id
                            : vehicle.vehicleTypeId,

                    vehicleType:
                        typeof vehicle.vehicleTypeId === "object"
                            ? vehicle.vehicleTypeId?.vehicleType || ""
                            : "",

                    regNo: vehicle.regNo || "",
                    make: vehicle.make || "",
                    model: vehicle.model || "",
                    year: vehicle.year ?? "",
                    odoMeter: vehicle.odoMeter ?? 0,
                    active: vehicle.active ?? true,
                    accessBlocked: vehicle.accessBlocked ?? false,
                    expiryDate: vehicle.expiryDate || null,
                    createdAt: vehicle.createdAt,
                    updatedAt: vehicle.updatedAt,
                }))
                : [];

            setVehicles(normalizedVehicles);
        } catch (err) {
            console.error("Error fetching vehicles:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load vehicles. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const filteredVehicles = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return vehicles.filter((vehicle) => {
            const matchesSearch =
                !search ||
                vehicle.regNo.toLowerCase().includes(search) ||
                vehicle.vehicleType.toLowerCase().includes(search) ||
                vehicle.branchName.toLowerCase().includes(search) ||
                vehicle.make.toLowerCase().includes(search) ||
                vehicle.model.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && vehicle.active) ||
                (statusFilter === "inactive" && !vehicle.active);

            return matchesSearch && matchesStatus;
        });
    }, [vehicles, searchTerm, statusFilter]);

    const handleRefresh = async () => {
        setSearchTerm("");
        setStatusFilter("all");
        setOpenMenuId(null);

        await fetchVehicles(true);
    };

    const handleView = (id) => {
        setOpenMenuId(null);
        navigate(`/vehicles/${id}`);
    };

    const handleEdit = (id) => {
        setOpenMenuId(null);
        navigate(`/vehicles/edit/${id}`);
    };

    const formatOdometer = (value) => {
        const number = Number(value);

        if (Number.isNaN(number)) {
            return "0 km";
        }

        return `${number.toLocaleString("en-IN")} km`;
    };

    // const formatExpiryDate = (value) => {
    //     if (!value) {
    //         return "—";
    //     }

    //     const date = new Date(value);

    //     if (Number.isNaN(date.getTime())) {
    //         return "—";
    //     }

    //     return date.toLocaleDateString("en-IN", {
    //         day: "2-digit",
    //         month: "short",
    //         year: "numeric",
    //     });
    // };

    // const isExpired = (value) => {
    //     if (!value) {
    //         return false;
    //     }

    //     const date = new Date(value);

    //     if (Number.isNaN(date.getTime())) {
    //         return false;
    //     }

    //     return date < new Date();
    // };

    if (loading) {
        return (
            <div className="sf-vehicle-list-page">
                <div className="sf-vehicle-loading">
                    <div className="sf-vehicle-spinner"></div>
                    <p>Loading vehicles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sf-vehicle-list-page">
            {/* PAGE HEADER */}
            <div className="sf-vehicle-page-header">
                <div>
                    <h1>Vehicles</h1>
                    <p>
                        Manage vehicles and their branch assignments.
                    </p>
                </div>

                <button
                    className="sf-vehicle-add-button"
                    onClick={() => navigate("/vehicles/add")}
                >
                    <FiPlus size={17} />
                    Add Vehicle
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="sf-vehicle-error">
                    {error}
                </div>
            )}

            {/* TOOLBAR */}
            <div className="sf-vehicle-toolbar">
                <div className="sf-vehicle-search">
                    <FiSearch size={17} />

                    <input
                        type="text"
                        placeholder="Search vehicles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="sf-vehicle-toolbar-right">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="sf-vehicle-status-filter"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <button
                        className="sf-vehicle-refresh-button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Refresh"
                    >
                        <FiRefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "sf-vehicle-refresh-spin"
                                    : ""
                            }
                        />
                    </button>
                </div>
            </div>

            {/* CARD */}
            <div className="sf-vehicle-table-card">
                <div className="sf-vehicle-card-header">
                    <div>
                        <h2>All Vehicles</h2>
                        <span>
                            {filteredVehicles.length} vehicle
                            {filteredVehicles.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {filteredVehicles.length === 0 ? (
                    <div className="sf-vehicle-empty">
                        <div className="sf-vehicle-empty-icon">
                            <FiTruck size={28} />
                        </div>

                        <h3>No vehicles found</h3>

                        <p>
                            Try changing your search or filter.
                        </p>
                    </div>
                ) : (
                    <div className="sf-vehicle-table-wrapper">
                        <table className="sf-vehicle-table">
                            <thead>
                                <tr>
                                    <th>Vehicle</th>
                                    <th>Registration</th>
                                    <th>Branch</th>
                                    <th>Vehicle Type</th>
                                    <th>Odometer</th>
                                    <th>Status</th>
                                    <th>Access</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredVehicles.map(
                                    (vehicle, index) => (
                                        <tr
                                            key={vehicle.id}
                                            className={
                                                openMenuId ===
                                                    vehicle.id &&
                                                    index >=
                                                    filteredVehicles.length -
                                                    2
                                                    ? "sf-vehicle-menu-up"
                                                    : ""
                                            }
                                        >
                                            {/* VEHICLE */}
                                            <td>
                                                <div className="sf-vehicle-identity">
                                                    <div className="sf-vehicle-avatar">
                                                        <FiTruck size={18} />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {vehicle.make ||
                                                                vehicle.model
                                                                ? `${vehicle.make} ${vehicle.model
                                                                    }`.trim()
                                                                : "Vehicle"}
                                                        </strong>

                                                        <span>
                                                            {vehicle.year ||
                                                                "Year not specified"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* REGISTRATION */}
                                            <td>
                                                <span className="sf-vehicle-reg-no">
                                                    {vehicle.regNo || "—"}
                                                </span>
                                            </td>

                                            {/* BRANCH */}
                                            <td>
                                                <span className="sf-vehicle-branch">
                                                    {vehicle.branchName ||
                                                        "—"}
                                                </span>
                                            </td>

                                            {/* TYPE */}
                                            <td>
                                                <span className="sf-vehicle-type">
                                                    {vehicle.vehicleType ||
                                                        "—"}
                                                </span>
                                            </td>

                                            {/* ODOMETER */}
                                            <td>
                                                <span className="sf-vehicle-odometer">
                                                    {formatOdometer(
                                                        vehicle.odoMeter
                                                    )}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                <span
                                                    className={`sf-vehicle-status-badge ${vehicle.active
                                                            ? "active"
                                                            : "inactive"
                                                        }`}
                                                >
                                                    <span></span>
                                                    {vehicle.active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            {/* ACCESS */}
                                            <td>
                                                <span
                                                    className={`sf-vehicle-access-badge ${vehicle.accessBlocked
                                                            ? "blocked"
                                                            : "allowed"
                                                        }`}
                                                >
                                                    {vehicle.accessBlocked ? (
                                                        <>
                                                            <FiLock
                                                                size={13}
                                                            />
                                                            Blocked
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiUnlock
                                                                size={13}
                                                            />
                                                            Allowed
                                                        </>
                                                    )}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="sf-vehicle-actions-cell">
                                                <button
                                                    className="sf-vehicle-menu-button"
                                                    onClick={() =>
                                                        setOpenMenuId(
                                                            openMenuId ===
                                                                vehicle.id
                                                                ? null
                                                                : vehicle.id
                                                        )
                                                    }
                                                >
                                                    <FiMoreVertical
                                                        size={18}
                                                    />
                                                </button>

                                                {openMenuId ===
                                                    vehicle.id && (
                                                        <div className="sf-vehicle-action-menu">
                                                            <button
                                                                onClick={() =>
                                                                    handleView(
                                                                        vehicle.id
                                                                    )
                                                                }
                                                            >
                                                                <FiEye
                                                                    size={15}
                                                                />
                                                                View
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        vehicle.id
                                                                    )
                                                                }
                                                            >
                                                                <FiEdit2
                                                                    size={15}
                                                                />
                                                                Edit
                                                            </button>
                                                        </div>
                                                    )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleList;