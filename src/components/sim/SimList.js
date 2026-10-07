import React, { useEffect, useMemo, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiMoreVertical,
    FiEye,
    FiEdit2,
    FiSmartphone,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { getSims } from "../../services/simService";
import "../../css/SimList.css";

const SimList = () => {
    const navigate = useNavigate();

    const [sims, setSims] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [openMenuId, setOpenMenuId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchSims = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getSims();

            const normalizedSims = Array.isArray(data)
                ? data.map((sim) => ({
                    id: sim._id,
                    simNo: sim.simNo || "",
                    m2mNo: sim.m2mNo || "",
                    provider: sim.provider || "",
                    apn: sim.apn || "",
                    status: sim.status || "active",
                    createdAt: sim.createdAt,
                    updatedAt: sim.updatedAt,
                }))
                : [];

            setSims(normalizedSims);
        } catch (err) {
            console.error("Error fetching SIMs:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load SIM records."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSims();
    }, []);

    const filteredSims = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return sims.filter((sim) => {
            const matchesSearch =
                !search ||
                sim.simNo.toLowerCase().includes(search) ||
                sim.m2mNo.toLowerCase().includes(search) ||
                sim.provider.toLowerCase().includes(search) ||
                sim.apn.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "all" ||
                sim.status.toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [sims, searchTerm, statusFilter]);

    const handleRefresh = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setOpenMenuId(null);
        fetchSims(true);
    };

    const handleView = (id) => {
        setOpenMenuId(null);
        navigate(`/sims/${id}`);
    };

    const handleEdit = (id) => {
        setOpenMenuId(null);
        navigate(`/sims/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="sf-sim-list-page">
                <div className="sf-sim-list-loading">
                    <div className="sf-sim-list-spinner" />
                    <span>Loading SIMs...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="sf-sim-list-page">
            {/* Page Header */}
            <div className="sf-sim-list-page-header">
                <div>
                    <h1>SIMs</h1>
                    <p>
                        Manage SIM cards and their connectivity details.
                    </p>
                </div>

                <button
                    type="button"
                    className="sf-sim-add-button"
                    onClick={() => navigate("/sims/add")}
                >
                    <FiPlus />
                    <span>Add SIM</span>
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="sf-sim-list-error">
                    {error}
                </div>
            )}

            {/* Toolbar */}
            <div className="sf-sim-list-toolbar">
                <div className="sf-sim-search-wrapper">
                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search SIM, M2M, provider or APN..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />
                </div>

                <select
                    className="sf-sim-status-filter"
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <button
                    type="button"
                    className="sf-sim-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh"
                >
                    <FiRefreshCw
                        className={
                            refreshing
                                ? "sf-sim-refresh-spinning"
                                : ""
                        }
                    />
                </button>
            </div>

            {/* Card */}
            <div className="sf-sim-list-card">
                <div className="sf-sim-list-card-header">
                    <div>
                        <h2>All SIMs</h2>
                        <span>
                            {filteredSims.length}{" "}
                            {filteredSims.length === 1
                                ? "SIM"
                                : "SIMs"}
                        </span>
                    </div>
                </div>

                {filteredSims.length === 0 ? (
                    <div className="sf-sim-empty">
                        <div className="sf-sim-empty-icon">
                            <FiSmartphone />
                        </div>

                        <h3>No SIMs found</h3>

                        <p>
                            Try changing your search or filter.
                        </p>
                    </div>
                ) : (
                    <div className="sf-sim-table-wrapper">
                        <table className="sf-sim-table">
                            <thead>
                                <tr>
                                    <th>SIM Number</th>
                                    <th>M2M Number</th>
                                    <th>Provider</th>
                                    <th>APN</th>
                                    <th>Status</th>
                                    <th className="sf-sim-actions-header">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSims.map((sim, index) => (
                                    <tr
                                        key={sim.id}
                                        className={
                                            openMenuId === sim.id &&
                                                index >=
                                                filteredSims.length - 2
                                                ? "sf-sim-menu-up"
                                                : ""
                                        }
                                    >
                                        <td>
                                            <div className="sf-sim-identity">
                                                <div className="sf-sim-avatar">
                                                    <FiSmartphone />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {sim.simNo}
                                                    </strong>

                                                    <span>
                                                        SIM Card
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="sf-sim-secondary-text">
                                                {sim.m2mNo || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="sf-sim-secondary-text">
                                                {sim.provider || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="sf-sim-secondary-text">
                                                {sim.apn || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`sf-sim-status-badge ${sim.status.toLowerCase() ===
                                                        "active"
                                                        ? "sf-sim-status-active"
                                                        : "sf-sim-status-inactive"
                                                    }`}
                                            >
                                                {sim.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    sim.status.slice(1)}
                                            </span>
                                        </td>

                                        <td className="sf-sim-actions-cell">
                                            <button
                                                type="button"
                                                className="sf-sim-menu-button"
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId ===
                                                            sim.id
                                                            ? null
                                                            : sim.id
                                                    )
                                                }
                                            >
                                                <FiMoreVertical />
                                            </button>

                                            {openMenuId === sim.id && (
                                                <div className="sf-sim-action-menu">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleView(
                                                                sim.id
                                                            )
                                                        }
                                                    >
                                                        <FiEye />
                                                        <span>
                                                            View
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(
                                                                sim.id
                                                            )
                                                        }
                                                    >
                                                        <FiEdit2 />
                                                        <span>
                                                            Edit
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimList;