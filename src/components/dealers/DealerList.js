import React, { useMemo, useState, useEffect } from "react";
import {
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiMoreVertical,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiPower,
    FiUsers,
} from "react-icons/fi";

import "../../css/DealerList.css";
import { getDealers } from "../../services/dealerService";
import { useNavigate } from "react-router-dom";


function DealerList() {

    const navigate = useNavigate();

    const [dealers, setDealers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [openMenuId, setOpenMenuId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchDealers = async (showRefreshLoader = false) => {

        try {

            setError("");

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getDealers();

            const normalizedDealers = Array.isArray(data)
                ? data.map((dealer) => ({
                    id: dealer._id,

                    name: dealer.name || "",
                    email: dealer.email || "",
                    phone: dealer.contactNo || "",
                    address: dealer.address || "",

                    subDealers: dealer.subDealers ?? null,
                    vehicles: dealer.vehicles ?? null,
                    status: dealer.status ?? null,

                    createdAt: dealer.createdAt,
                    updatedAt: dealer.updatedAt,
                }))
                : [];

            setDealers(normalizedDealers);

        } catch (err) {

            console.error("Error fetching dealers:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load dealers. Please try again."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };

    useEffect(() => {
        fetchDealers();
    }, []);

    const filteredDealers = useMemo(() => {

        const search = searchTerm.toLowerCase().trim();

        return dealers.filter((dealer) => {

            const matchesSearch =
                !search ||
                dealer.name?.toLowerCase().includes(search) ||
                dealer.email?.toLowerCase().includes(search) ||
                dealer.phone?.toLowerCase().includes(search) ||
                dealer.address?.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                (dealer.status && dealer.status === statusFilter);

            return matchesSearch && matchesStatus;

        });

    }, [dealers, searchTerm, statusFilter]);

    const handleRefresh = () => {

        setSearchTerm("");
        setStatusFilter("All");
        setOpenMenuId(null);
        fetchDealers(true);
    };

    const handleView = (dealerId) => {
        navigate(`/dealers/${dealerId}`);
        setOpenMenuId(null);
    };

    const handleEdit = (dealerId) => {
        navigate(`/dealers/edit/${dealerId}`);
        setOpenMenuId(null);
    };

    const handleAddDealer = () => {
        navigate("/dealers/add");
    };

    const handleToggleStatus = (dealerId) => {
        console.log(
            "Dealer status API will be implemented later:",
            dealerId
        );
        setOpenMenuId(null);
    };

    const handleDelete = (dealerId) => {
        console.log(
            "Dealer delete API will be implemented later:",
            dealerId
        );
        setOpenMenuId(null);
    };

    if (loading) {

        return (
            <div className="sf-dealer-page">
                <div className="sf-dealer-page-header">
                    <div>
                        <h1>Dealers</h1>
                        <p>
                            Manage dealers and their fleet hierarchy.
                        </p>
                    </div>
                </div>

                <div className="sf-dealer-card">
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                        }}
                    >
                        Loading dealers...
                    </div>
                </div>
            </div>
        );
    }

    return (

        <div className="sf-dealer-page">
            <div className="sf-dealer-page-header">

                <div>
                    <h1>
                        Dealers
                    </h1>

                    <p>
                        Manage dealers and their fleet hierarchy.
                    </p>
                </div>

                <button
                    className="sf-dealer-add-button"
                    onClick={handleAddDealer}
                >
                    <FiPlus />
                    <span>
                        Add Dealer
                    </span>
                </button>
            </div>

            {error && (

                <div
                    className="sf-dealer-error"
                    style={{
                        marginBottom: "16px",
                    }}
                >
                    {error}
                </div>

            )}

            <div className="sf-dealer-toolbar">
                {/* SEARCH */}

                <div className="sf-dealer-search">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search dealers..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />
                </div>

                <div className="sf-dealer-filter">

                    <label>
                        Status
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="All">
                            All
                        </option>

                        <option value="Active">
                            Active
                        </option>

                        <option value="Inactive">
                            Inactive
                        </option>
                    </select>
                </div>

                {/* REFRESH */}

                <button
                    className="sf-dealer-refresh-button"
                    onClick={handleRefresh}
                    title="Reset filters"
                    disabled={refreshing}
                >

                    <FiRefreshCw
                        className={
                            refreshing
                                ? "sf-refresh-spinning"
                                : ""
                        }
                    />

                    <span>
                        Reset
                    </span>
                </button>
            </div>

            <div className="sf-dealer-card">
                {/* CARD HEADER */}
                <div className="sf-dealer-card-header">

                    <div>
                        <h2>
                            All Dealers
                        </h2>

                        <span>
                            {filteredDealers.length} dealer
                            {filteredDealers.length !== 1
                                ? "s"
                                : ""}
                        </span>
                    </div>
                </div>

                {filteredDealers.length > 0 ? (

                    <div className="sf-dealer-table-wrapper">
                        <table className="sf-dealer-table">
                            <thead>
                                <tr>
                                    <th>
                                        Dealer
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        SubDealers
                                    </th>

                                    <th>
                                        Vehicles
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th></th>

                                </tr>
                            </thead>

                            <tbody>

                                {filteredDealers.map((dealer,index) => (

                                    <tr
                                        key={dealer.id}
                                        className={
                                            openMenuId === dealer.id &&
                                                index >= filteredDealers.length - 1
                                                ? "sf-dealer-menu-up"
                                                : ""
                                        }
                                    >

                                        <td>
                                            <div className="sf-dealer-identity">
                                                <div className="sf-dealer-avatar">
                                                    {dealer.name
                                                        ? dealer.name
                                                            .charAt(0)
                                                            .toUpperCase()
                                                        : "D"}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {dealer.name || "—"}
                                                    </strong>
                                                    <span>
                                                        {dealer.email || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* =========================
                                            CONTACT
                                        ========================== */}

                                        <td>
                                            <div className="sf-dealer-contact">
                                                {dealer.phone || "—"}
                                            </div>
                                        </td>

                                        {/* =========================
                                            SUB DEALERS
                                        ========================== */}

                                        <td>
                                            <div className="sf-dealer-count">
                                                <FiUsers />
                                                <span>
                                                    {dealer.subDealers ?? "—"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* =========================
                                            VEHICLES
                                        ========================== */}

                                        <td>
                                            <strong className="sf-dealer-vehicle-count">
                                                {dealer.vehicles ?? "—"}
                                            </strong>
                                        </td>

                                        {/* =========================
                                            STATUS
                                        ========================== */}
                                        <td>
                                            {dealer.status ? (
                                                <span
                                                    className={`sf-dealer-status ${dealer.status === "Active"
                                                        ? "active"
                                                        : "inactive"
                                                        }`}
                                                >
                                                    <span className="sf-status-dot" />
                                                    {dealer.status}
                                                </span>
                                            ) : (
                                                <span className="sf-dealer-status">
                                                    <span className="sf-status-dot" />
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* =========================
                                            ACTIONS
                                        ========================== */}

                                        <td className="sf-dealer-actions-cell">

                                            <button
                                                className="sf-dealer-menu-button"
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId === dealer.id
                                                            ? null
                                                            : dealer.id
                                                    )
                                                }
                                                aria-label={`Actions for ${dealer.name}`}
                                            >
                                                <FiMoreVertical />
                                            </button>

                                            {openMenuId === dealer.id && (
                                                <div className="sf-dealer-action-menu">
                                                    {/* VIEW */}
                                                    <button
                                                        onClick={() =>
                                                            handleView(
                                                                dealer.id
                                                            )
                                                        }
                                                    >
                                                        <FiEye />
                                                        <span>
                                                            View
                                                        </span>
                                                    </button>

                                                    {/* EDIT */}
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                dealer.id
                                                            )
                                                        }
                                                    >
                                                        <FiEdit2 />
                                                        <span>
                                                            Edit
                                                        </span>
                                                    </button>

                                                    {/* STATUS */}
                                                    <button
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                dealer.id
                                                            )
                                                        }
                                                        title="Status management will be connected later"
                                                    >
                                                        <FiPower />
                                                        <span>
                                                            {dealer.status === "Active"
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </span>
                                                    </button>

                                                    {/* DELETE */}

                                                    <button
                                                        className="danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                dealer.id
                                                            )
                                                        }
                                                        title="Delete API will be connected later"
                                                    >
                                                        <FiTrash2 />

                                                        <span>
                                                            Delete
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

                ) : (

                    /* =================================================
                        EMPTY STATE
                    ================================================= */

                    <div className="sf-dealer-empty">
                        <div className="sf-dealer-empty-icon">
                            <FiUsers />
                        </div>

                        <h3>
                            No dealers found
                        </h3>

                        <p>
                            Try changing your search or filter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default DealerList;