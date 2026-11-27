import React, { useEffect, useState } from "react";

import {
    FiArrowLeft,
    FiEdit2,
    FiCalendar,
    FiHome,
    FiMapPin,
    FiShield
} from "react-icons/fi";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getBranchById,
} from "../../services/branchService";
import "../../css/BranchView.css";
import { usePermission } from "../../context/PermissionContext";
import "../../css/AccessDenied.css";

function BranchView() {

    const { id } = useParams();

    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading
    } = usePermission();

    const canViewBranches =
        !permissionsLoading && hasPermission("Branch", "canView");

    const canEditBranches =
        !permissionsLoading && hasPermission("Branch", "canEdit");

    const [branch, setBranch] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        if (permissionsLoading || !canViewBranches) {
            return;
        }

        let mounted = true;

        const fetchBranch = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getBranchById(id);

                if (mounted) {
                    setBranch(data);
                }

            } catch (err) {
                console.error("Error loading branch:", err);

                if (mounted) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load branch details."
                    );
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchBranch();

        return () => {
            mounted = false;
        };

    }, [id, permissionsLoading, canViewBranches]);

    const handleBack = () => {
        navigate("/branches");
    };

    const handleEdit = () => {
        navigate(`/branches/edit/${id}`);
    };

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
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

    if (!canViewBranches) {
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
                        You don't have permission to view Branches.
                        Please contact your administrator if you
                        believe this is a mistake.
                    </p>

                    <div className="sf-access-denied-divider"></div>

                    <button
                        className="sf-access-denied-button"
                        onClick={handleBack}
                    >
                        <FiArrowLeft />
                        Back to Branches
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

                    <span>
                        Loading branch details...
                    </span>

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

                        <h1>
                            Branch Details
                        </h1>

                        <p>
                            View branch information.
                        </p>

                    </div>

                </div>

                <div className="sf-branch-view-error-card">

                    <div className="sf-branch-view-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load branch
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        Back to Branches
                    </button>

                </div>

            </div>
        );
    }

    if (!branch) {
        return null;
    }

    const branchName =
        branch.name?.trim() ||
        "Unnamed Branch";

    const branchInitial =
        branchName
            .charAt(0)
            .toUpperCase();

    const company =
        typeof branch.companyId === "object"
            ? branch.companyId
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
                        title="Back to Branches"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>

                        <h1>
                            Branch Details
                        </h1>

                        <p>
                            View branch information.
                        </p>

                    </div>

                </div>

                {canEditBranches && (
                    <button
                        className="sf-branch-view-edit-button"
                        onClick={handleEdit}
                        type="button"
                    >
                        <FiEdit2 />

                        <span>
                            Edit Branch
                        </span>
                    </button>
                )}

            </div>

            {/* PROFILE */}

            <div className="sf-branch-view-profile-card">

                <div className="sf-branch-view-profile-avatar">

                    {branchInitial}

                </div>

                <div>

                    <h2>
                        {branchName}
                    </h2>

                    <span>
                        Branch
                    </span>

                </div>

            </div>

            {/* INFORMATION */}

            <div className="sf-branch-view-grid">

                {/* BASIC INFORMATION */}

                <div className="sf-branch-view-card">

                    <div className="sf-branch-view-card-header">

                        <div className="sf-branch-view-card-icon">
                            <FiMapPin />
                        </div>

                        <div>

                            <h3>
                                Basic Information
                            </h3>

                            <p>
                                Branch contact details
                            </p>

                        </div>

                    </div>

                    <div className="sf-branch-view-details">

                        <div className="sf-branch-view-detail-row">

                            <span>
                                Branch Name
                            </span>

                            <strong>
                                {branchName}
                            </strong>

                        </div>

                        <div className="sf-branch-view-detail-row">

                            <span>
                                Contact Number
                            </span>

                            <strong>
                                {branch.contactNo ||
                                    "—"}
                            </strong>

                        </div>

                        <div className="sf-branch-view-detail-row">

                            <span>
                                Address
                            </span>

                            <strong>
                                {branch.address ||
                                    "—"}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* COMPANY */}

                <div className="sf-branch-view-card">

                    <div className="sf-branch-view-card-header">

                        <div className="sf-branch-view-card-icon">
                            <FiHome />
                        </div>

                        <div>

                            <h3>
                                Company
                            </h3>

                            <p>
                                Parent company
                            </p>

                        </div>

                    </div>

                    <div className="sf-branch-view-details">

                        <div className="sf-branch-view-detail-row">

                            <span>
                                Company Name
                            </span>

                            <strong>
                                {company?.name ||
                                    "—"}
                            </strong>

                        </div>

                        {/* <div className="sf-branch-view-detail-row">

                            <span>
                                Company ID
                            </span>

                            <strong>
                                {company?._id ||
                                    branch.companyId ||
                                    "—"}
                            </strong>

                        </div> */}

                    </div>

                </div>

                {/* RECORD INFORMATION */}

                <div className="sf-branch-view-card">

                    <div className="sf-branch-view-card-header">

                        <div className="sf-branch-view-card-icon">
                            <FiCalendar />
                        </div>

                        <div>

                            <h3>
                                Record Information
                            </h3>

                            <p>
                                Branch record history
                            </p>

                        </div>

                    </div>

                    <div className="sf-branch-view-details">

                        <div className="sf-branch-view-detail-row">

                            <span>
                                Created
                            </span>

                            <strong>
                                {formatDate(
                                    branch.createdAt
                                )}
                            </strong>

                        </div>

                        <div className="sf-branch-view-detail-row">

                            <span>
                                Last Updated
                            </span>

                            <strong>
                                {formatDate(
                                    branch.updatedAt
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default BranchView;