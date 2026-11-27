import React, { useEffect, useMemo, useState } from "react";

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

import "../../css/SubDealerList.css";
import { getSubDealers, updateSubDealerStatus } from "../../services/subDealerService";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../context/PermissionContext";


function SubDealerList() {

    const navigate = useNavigate();
    const {
        hasPermission,
        loading: permissionsLoading
    } = usePermission();

    const canViewSubDealers =
        !permissionsLoading && hasPermission("SubDealer", "canView");

    const canAddSubDealers =
        !permissionsLoading && hasPermission("SubDealer", "canAdd");

    const canEditSubDealers =
        !permissionsLoading && hasPermission("SubDealer", "canEdit");

    const canDeleteSubDealers =
        !permissionsLoading && hasPermission("SubDealer", "canDelete");

    const canShowActions =
        canViewSubDealers ||
        canEditSubDealers ||
        canDeleteSubDealers;

    const isWebMaster = localStorage.getItem("role") === "WebMaster";

    const canManageSubDealerStatus =
        isWebMaster && canEditSubDealers;

    const [subDealers, setSubDealers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [updatingStatusId, setUpdatingStatusId] = useState(null);


    const fetchSubDealers = async (showRefreshLoader = false) => {

        try {

            setError("");

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getSubDealers();

            const normalizedSubDealers = Array.isArray(data)
                ? data.map((subDealer) => ({
                    id: subDealer._id,

                    name: subDealer.name || "",
                    email: subDealer.email || "",
                    phone: subDealer.contactNo || "",
                    address: subDealer.address || "",

                    dealerId: subDealer.dealerId?._id || null,
                    dealerName: subDealer.dealerId?.name || "",
                    status: subDealer.status || "inactive",
                    createdAt: subDealer.createdAt,
                    updatedAt: subDealer.updatedAt,
                }))
                : [];

            setSubDealers(normalizedSubDealers);

        } catch (err) {

            console.error("Error fetching subDealers:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load subdealers. Please try again."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    useEffect(() => {
        fetchSubDealers();
    }, []);


    const filteredSubDealers = useMemo(() => {

        const search = searchTerm.toLowerCase().trim();

        return subDealers.filter((subDealer) => {

            return (
                !search ||
                subDealer.name?.toLowerCase().includes(search) ||
                subDealer.email?.toLowerCase().includes(search) ||
                subDealer.phone?.toLowerCase().includes(search) ||
                subDealer.address?.toLowerCase().includes(search) ||
                subDealer.dealerName?.toLowerCase().includes(search)
            );

        });

    }, [subDealers, searchTerm]);


    const handleRefresh = () => {

        setSearchTerm("");
        setOpenMenuId(null);

        fetchSubDealers(true);
    };


    const handleView = (subDealerId) => {
        navigate(`/subDealer/${subDealerId}`);
        setOpenMenuId(null);
    };


    const handleEdit = (subDealerId) => {
        navigate(`/subDealer/edit/${subDealerId}`);
        setOpenMenuId(null);
    };

    const handleAddSubDealer = () => {
        navigate("/subDealer/add");
    };

    const handleToggleStatus = async (subDealer) => {
        if (!canManageSubDealerStatus || updatingStatusId) {
            return;
        }

        const newStatus =
            subDealer.status === "active" ? "inactive" : "active";

        const actionText =
            newStatus === "active" ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} ${subDealer.name}?`
        );

        if (!confirmed) {
            setOpenMenuId(null);
            return;
        }

        try {
            setUpdatingStatusId(subDealer.id);
            setError("");
            setOpenMenuId(null);

            await updateSubDealerStatus(subDealer.id, newStatus);

            await fetchSubDealers(true);

        } catch (err) {
            console.error("Error updating SubDealer status:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update SubDealer status. Please try again."
            );
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleDelete = (subDealerId) => {
        console.log(
            "SubDealer delete API will be implemented later:",
            subDealerId
        );
        setOpenMenuId(null);
    };

    if (permissionsLoading) {
        return (
            <div className="sf-subdealer-page">
                <div className="sf-subdealer-card">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        Checking permissions...
                    </div>
                </div>
            </div>
        );
    }

    if (!canViewSubDealers) {
        return (
            <div className="sf-subdealer-page">
                <div className="sf-subdealer-card">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <h2>Access Denied</h2>
                        <p>You don't have permission to view SubDealers.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="sf-subdealer-page">
                <div className="sf-subdealer-page-header">
                    <div>
                        <h1>
                            SubDealers
                        </h1>
                        <p>
                            Manage subdealers and their dealer relationships.
                        </p>
                    </div>
                </div>

                <div className="sf-subdealer-card">
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                        }}
                    >
                        Loading subdealers...
                    </div>
                </div>
            </div>
        );
    }

    return (

        <div className="sf-subdealer-page">

            {/* =========================
                PAGE HEADER
            ========================== */}

            <div className="sf-subdealer-page-header">

                <div>

                    <h1>
                        SubDealers
                    </h1>

                    <p>
                        Manage subdealers and their dealer relationships.
                    </p>

                </div>


                {canAddSubDealers && (
                    <button
                        className="sf-subdealer-add-button"
                        onClick={handleAddSubDealer}
                    >
                        <FiPlus />
                        <span>Add SubDealer</span>
                    </button>
                )}

            </div>


            {/* =========================
                ERROR
            ========================== */}

            {error && (

                <div
                    className="sf-subdealer-error"
                    style={{
                        marginBottom: "16px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* =========================
                TOOLBAR
            ========================== */}

            <div className="sf-subdealer-toolbar">

                {/* SEARCH */}

                <div className="sf-subdealer-search">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search subdealers..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />

                </div>


                {/* REFRESH */}

                <button
                    className="sf-subdealer-refresh-button"
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


            {/* =========================
                MAIN CARD
            ========================== */}

            <div className="sf-subdealer-card">

                {/* CARD HEADER */}

                <div className="sf-subdealer-card-header">

                    <div>

                        <h2>
                            All SubDealers
                        </h2>

                        <span>
                            {filteredSubDealers.length} subdealer
                            {filteredSubDealers.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                </div>


                {filteredSubDealers.length > 0 ? (

                    <div className="sf-subdealer-table-wrapper">

                        <table className="sf-subdealer-table">

                            <thead>

                                <tr>

                                    <th>
                                        SubDealer
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Dealer
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>Status</th>

                                    <th>
                                        Address
                                    </th>

                                    <th></th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredSubDealers.map(
                                    (subDealer, index) => (

                                        <tr
                                            key={subDealer.id}
                                            className={
                                                openMenuId === subDealer.id &&
                                                    index >= filteredSubDealers.length - 1
                                                    ? "sf-subdealer-menu-up"
                                                    : ""
                                            }
                                        >

                                            {/* =========================
                                                SUB DEALER
                                            ========================== */}

                                            <td>

                                                <div className="sf-subdealer-identity">

                                                    <div className="sf-subdealer-avatar">

                                                        {subDealer.name
                                                            ? subDealer.name
                                                                .charAt(0)
                                                                .toUpperCase()
                                                            : "S"}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {subDealer.name || "—"}
                                                        </strong>

                                                        <span>
                                                            {subDealer.email || "—"}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* =========================
                                                CONTACT
                                            ========================== */}

                                            <td>

                                                <div className="sf-subdealer-contact">

                                                    {subDealer.phone || "—"}

                                                </div>

                                            </td>


                                            {/* =========================
                                                DEALER
                                            ========================== */}

                                            <td>

                                                <div className="sf-subdealer-dealer">

                                                    <FiUsers />

                                                    <span>
                                                        {subDealer.dealerName || "—"}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* =========================
                                                EMAIL
                                            ========================== */}

                                            <td>

                                                {subDealer.email || "—"}

                                            </td>

                                            <td>
                                                <span
                                                    className={`sf-dealer-status-badge ${subDealer.status?.toLowerCase() === "active"
                                                            ? "active"
                                                            : "inactive"
                                                        }`}
                                                >
                                                    <span className="sf-dealer-status-dot"></span>

                                                    {subDealer.status?.toLowerCase() === "active"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>


                                            {/* =========================
                                                ADDRESS
                                            ========================== */}

                                            <td>

                                                <div className="sf-subdealer-address">

                                                    {subDealer.address || "—"}

                                                </div>

                                            </td>


                                            {/* =========================
                                                ACTIONS
                                            ========================== */}

                                            <td className="sf-subdealer-actions-cell">

                                                <button
                                                    className="sf-subdealer-menu-button"
                                                    onClick={() =>
                                                        setOpenMenuId(
                                                            openMenuId === subDealer.id
                                                                ? null
                                                                : subDealer.id
                                                        )
                                                    }
                                                    aria-label={`Actions for ${subDealer.name}`}
                                                >

                                                    <FiMoreVertical />

                                                </button>


                                                {openMenuId === subDealer.id && (

                                                    <div className="sf-subdealer-action-menu">

                                                        {/* VIEW */}

                                                        {canViewSubDealers && (
                                                            <button
                                                                onClick={() => handleView(subDealer.id)}
                                                            >
                                                                <FiEye />
                                                                <span>View</span>
                                                            </button>
                                                        )}


                                                        {/* EDIT */}

                                                        {canEditSubDealers && (
                                                            <button
                                                                onClick={() => handleEdit(subDealer.id)}
                                                            >
                                                                <FiEdit2 />
                                                                <span>Edit</span>
                                                            </button>
                                                        )}


                                                        {/* STATUS */}

                                                        {canManageSubDealerStatus && (
                                                            <button
                                                                onClick={() => handleToggleStatus(subDealer)}
                                                                disabled={updatingStatusId === subDealer.id}
                                                            >
                                                                <FiPower />

                                                                <span>
                                                                    {updatingStatusId === subDealer.id
                                                                        ? "Updating..."
                                                                        : subDealer.status === "active"
                                                                            ? "Deactivate"
                                                                            : "Activate"}
                                                                </span>
                                                            </button>
                                                        )}


                                                        {/* DELETE */}

                                                        {canDeleteSubDealers && (
                                                            <button
                                                                className="danger"
                                                                onClick={() => handleDelete(subDealer.id)}
                                                            >
                                                                <FiTrash2 />
                                                                <span>Delete</span>
                                                            </button>
                                                        )}

                                                    </div>

                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    /* =========================
                       EMPTY STATE
                    ========================== */

                    <div className="sf-subdealer-empty">

                        <div className="sf-subdealer-empty-icon">

                            <FiUsers />

                        </div>


                        <h3>
                            No subdealers found
                        </h3>


                        <p>
                            Try changing your search.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}


export default SubDealerList;