
import React, { useEffect, useState } from "react";

import {
    FiArrowLeft,
    FiEdit2,
    FiCalendar,
    FiUser,
    FiBriefcase,
    FiShield,
    FiMapPin,
} from "react-icons/fi";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { getUserById } from "../../services/userService";
import { getDealers } from "../../services/dealerService";
import { getSubDealers } from "../../services/subDealerService";
import { getCompanies } from "../../services/companyService";
import { getBranches } from "../../services/branchService";

import "../../css/UserView.css";
import { usePermission } from "../../context/PermissionContext";
import "../../css/AccessDenied.css";

function UserView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading,
    } = usePermission();

    const canViewUsers =
        !permissionsLoading && hasPermission("User", "canView");

    const canEditUsers =
        !permissionsLoading && hasPermission("User", "canEdit");

    const [user, setUser] = useState(null);

    const [organizations, setOrganizations] = useState({
        Dealer: [],
        SubDealer: [],
        Company: [],
        Branch: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (permissionsLoading || !canViewUsers || !id) {
            return;
        }

        let mounted = true;

        const fetchUser = async () => {
            try {
                setLoading(true);
                setError("");

                const results = await Promise.allSettled([
                    getUserById(id),
                    getDealers(),
                    getSubDealers(),
                    getCompanies(),
                    getBranches(),
                ]);

                if (!mounted) return;

                if (results[0].status === "rejected") {
                    throw results[0].reason;
                }

                const userData = results[0].value;

                if (!userData) {
                    throw new Error("User details not found.");
                }

                setUser(userData);

                setOrganizations({
                    Dealer:
                        results[1].status === "fulfilled" &&
                        Array.isArray(results[1].value)
                            ? results[1].value
                            : [],
                    SubDealer:
                        results[2].status === "fulfilled" &&
                        Array.isArray(results[2].value)
                            ? results[2].value
                            : [],
                    Company:
                        results[3].status === "fulfilled" &&
                        Array.isArray(results[3].value)
                            ? results[3].value
                            : [],
                    Branch:
                        results[4].status === "fulfilled" &&
                        Array.isArray(results[4].value)
                            ? results[4].value
                            : [],
                });

            } catch (err) {
                console.error("Error loading user:", err);

                if (mounted) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load user details."
                    );
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchUser();

        return () => {
            mounted = false;
        };

    }, [id, permissionsLoading, canViewUsers]);

    const handleBack = () => {
        navigate("/user");
    };

    const handleEdit = () => {
        navigate(`/user/edit/${id}`);
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

    const getId = (value) => {
        if (!value) return "";

        return String(value._id || value);
    };

    const getOrganizationName = () => {
        if (!user?.organizationId) return "—";

        // If the organization is populated, use its name directly.
        if (
            typeof user.organizationId === "object" &&
            user.organizationId.name
        ) {
            return user.organizationId.name;
        }

        const organizationId = getId(user.organizationId);

        const organizationList =
            organizations[user.organizationType] || [];

        const organization = organizationList.find(
            (item) => getId(item._id) === organizationId
        );

        return organization?.name || organizationId || "—";
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

    if (!canViewUsers) {
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
                        You don't have permission to view Users.
                        Please contact your administrator if you
                        believe this is a mistake.
                    </p>

                    <div className="sf-access-denied-divider"></div>

                    <button
                        className="sf-access-denied-button"
                        onClick={handleBack}
                        type="button"
                    >
                        <FiArrowLeft />
                        Back to Users
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
            <div className="sf-user-view-page">

                <div className="sf-user-view-loading">

                    <div className="sf-user-view-spinner" />

                    <span>
                        Loading user details...
                    </span>

                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="sf-user-view-page">

                <div className="sf-user-view-page-header">

                    <button
                        className="sf-user-view-back-button"
                        onClick={handleBack}
                        type="button"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>User Details</h1>
                        <p>View user information.</p>
                    </div>

                </div>

                <div className="sf-user-view-error-card">

                    <div className="sf-user-view-error-icon">
                        !
                    </div>

                    <h2>Unable to load user</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        Back to Users
                    </button>

                </div>

            </div>
        );
    }

    if (!user) {
        return null;
    }

    const userName =
        user.name?.trim() || "Unnamed User";

    const userInitial =
        userName.charAt(0).toUpperCase();

    const roleName =
        user.userTypeId?.name ||
        user.userType ||
        user.role ||
        "—";

    const organizationName = getOrganizationName();

    const branchName =
        user.organizationType === "Branch"
            ? organizationName
            : user.branchId?.name ||
              (user.branchId ? getId(user.branchId) : "Not assigned");

    return (
        <div className="sf-user-view-page">

            {/* HEADER */}

            <div className="sf-user-view-page-header">

                <div className="sf-user-view-heading">

                    <button
                        className="sf-user-view-back-button"
                        onClick={handleBack}
                        type="button"
                        title="Back to Users"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>User Details</h1>

                        <p>
                            View user information.
                        </p>
                    </div>

                </div>

                {canEditUsers && (
                    <button
                        className="sf-user-view-edit-button"
                        onClick={handleEdit}
                        type="button"
                    >
                        <FiEdit2 />

                        <span>
                            Edit User
                        </span>
                    </button>
                )}

            </div>

            {/* PROFILE */}

            <div className="sf-user-view-profile-card">

                <div className="sf-user-view-profile-avatar">
                    {userInitial}
                </div>

                <div className="sf-user-view-profile-info">

                    <h2>{userName}</h2>

                    <p>
                        @{user.username || "username unavailable"}
                    </p>

                    <span>
                        {roleName}
                    </span>

                </div>

                <div
                    className={`sf-user-view-status ${
                        user.status === "active"
                            ? "sf-user-view-status-active"
                            : "sf-user-view-status-inactive"
                    }`}
                >
                    {user.status || "Unknown"}
                </div>

            </div>

            {/* INFORMATION */}

            <div className="sf-user-view-grid">

                {/* BASIC INFORMATION */}

                <div className="sf-user-view-card">

                    <div className="sf-user-view-card-header">

                        <div className="sf-user-view-card-icon">
                            <FiUser />
                        </div>

                        <div>
                            <h3>Basic Information</h3>

                            <p>
                                User contact and account details
                            </p>
                        </div>

                    </div>

                    <div className="sf-user-view-details">

                        <div className="sf-user-view-detail-row">
                            <span>Full Name</span>
                            <strong>{userName}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Username</span>
                            <strong>{user.username || "—"}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Email Address</span>
                            <strong>{user.email || "—"}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Phone Number</span>
                            <strong>{user.phoneNo || "—"}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Address</span>
                            <strong>{user.address || "—"}</strong>
                        </div>

                    </div>

                </div>

                {/* ROLE AND ORGANIZATION */}

                <div className="sf-user-view-card">

                    <div className="sf-user-view-card-header">

                        <div className="sf-user-view-card-icon">
                            <FiBriefcase />
                        </div>

                        <div>
                            <h3>Role & Organization</h3>

                            <p>
                                User role and organization assignment
                            </p>
                        </div>

                    </div>

                    <div className="sf-user-view-details">

                        <div className="sf-user-view-detail-row">
                            <span>User Role</span>
                            <strong>{roleName}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Organization Type</span>
                            <strong>{user.organizationType || "—"}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Organization Name</span>
                            <strong>{organizationName}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Branch Assignment</span>
                            <strong>{branchName}</strong>
                        </div>

                    </div>

                </div>

                {/* RECORD INFORMATION */}

                <div className="sf-user-view-card">

                    <div className="sf-user-view-card-header">

                        <div className="sf-user-view-card-icon">
                            <FiCalendar />
                        </div>

                        <div>
                            <h3>Record Information</h3>

                            <p>
                                User account history
                            </p>
                        </div>

                    </div>

                    <div className="sf-user-view-details">

                        <div className="sf-user-view-detail-row">
                            <span>Account Status</span>
                            <strong>{user.status || "—"}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Registration Source</span>
                            <strong>{user.registrationSource || "—"}</strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Email Verified At</span>
                            <strong>
                                {formatDate(user.emailVerifiedAt)}
                            </strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Created</span>
                            <strong>
                                {formatDate(user.createdAt)}
                            </strong>
                        </div>

                        <div className="sf-user-view-detail-row">
                            <span>Last Updated</span>
                            <strong>
                                {formatDate(user.updatedAt)}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default UserView;
