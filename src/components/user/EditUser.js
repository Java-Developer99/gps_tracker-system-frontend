
import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiAlertCircle,
    FiCheckCircle,
    FiShield,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { getUserById, updateUser } from "../../services/userService";
import { getDealers } from "../../services/dealerService";
import { getSubDealers } from "../../services/subDealerService";
import { getCompanies } from "../../services/companyService";
import { getBranches } from "../../services/branchService";

import { usePermission } from "../../context/PermissionContext";

import "../../css/UserForm.css";
import "../../css/AccessDenied.css";

const getId = (value) => {
    if (!value) return "";
    return String(value._id || value);
};

const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getOrganizationName = (user, organizations) => {
    const organizationId = getId(user.organizationId);

    if (!organizationId) return "Not assigned";

    const organizationList = organizations[user.organizationType] || [];

    const organization = organizationList.find(
        (item) => getId(item._id) === organizationId
    );

    return organization?.name || organizationId;
};

const ReadOnlyField = ({ label, value }) => (
    <div className="sf-user-form-group">
        <label>{label}</label>
        <div className="sf-user-readonly-value">
            {value === null || value === undefined || value === ""
                ? "Not available"
                : String(value)}
        </div>
    </div>
);

function EditUser() {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        hasPermission,
        loading: permissionsLoading,
    } = usePermission();

    const canEditUsers =
        !permissionsLoading && hasPermission("User", "canEdit");

    const [user, setUser] = useState(null);

    const [organizations, setOrganizations] = useState({
        Dealer: [],
        SubDealer: [],
        Company: [],
        Branch: [],
    });

    const [formData, setFormData] = useState({
        name: "",
        phoneNo: "",
        email: "",
        address: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");

    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleBack = () => navigate("/user");

    useEffect(() => {
        if (permissionsLoading || !canEditUsers || !id) return;

        let mounted = true;

        const loadUser = async () => {
            setLoadingData(true);
            setServerError("");

            try {
                const results = await Promise.allSettled([
                    getUserById(id),
                    getDealers(),
                    getSubDealers(),
                    getCompanies(),
                    getBranches(),
                ]);

                if (!mounted) return;

                const userResult = results[0];

                if (userResult.status === "rejected") {
                    throw userResult.reason;
                }

                const fetchedUser = userResult.value;

                if (!fetchedUser) {
                    throw new Error("User details could not be found.");
                }

                setUser(fetchedUser);

                setFormData({
                    name: fetchedUser.name || "",
                    phoneNo: fetchedUser.phoneNo || "",
                    email: fetchedUser.email || "",
                    address: fetchedUser.address || "",
                });

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
            } catch (error) {
                console.error("Error loading Edit User page:", error);

                if (mounted) {
                    setServerError(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to load user details."
                    );
                }
            } finally {
                if (mounted) setLoadingData(false);
            }
        };

        loadUser();

        return () => {
            mounted = false;
        };
    }, [id, permissionsLoading, canEditUsers]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setServerError("");
        setSuccess("");
    };

    const validateForm = () => {
        const validationErrors = {};

        if (!formData.name.trim()) {
            validationErrors.name = "Name is required.";
        }

        if (!formData.phoneNo.trim()) {
            validationErrors.phoneNo = "Phone number is required.";
        } else if (!/^\d{10}$/.test(formData.phoneNo.trim())) {
            validationErrors.phoneNo = "Enter a valid 10-digit phone number.";
        }

        if (!formData.email.trim()) {
            validationErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ) {
            validationErrors.email = "Enter a valid email address.";
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!canEditUsers) {
            setServerError("You don't have permission to edit Users.");
            return;
        }

        setServerError("");
        setSuccess("");

        if (!validateForm()) return;

        try {
            setSaving(true);

            // Only these four fields are editable in the backend.
            const payload = {
                name: formData.name.trim(),
                phoneNo: formData.phoneNo.trim(),
                email: formData.email.trim().toLowerCase(),
                address: formData.address.trim(),
            };

            const updatedUser = await updateUser(id, payload);

            if (updatedUser && typeof updatedUser === "object") {
                setUser((previous) => ({
                    ...previous,
                    ...updatedUser,
                }));
            }

            setSuccess("User details updated successfully.");

            setTimeout(() => {
                navigate("/user");
            }, 1000);
        } catch (error) {
            console.error("Error updating user:", error);

            setServerError(
                error.response?.data?.message ||
                "Unable to update user. Please try again."
            );
        } finally {
            setSaving(false);
        }
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

    if (!canEditUsers) {
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
                        You don't have permission to edit Users.
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

    if (loadingData) {
        return (
            <div className="sf-user-form-loading">
                Loading user details...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="sf-user-form-page">
                <div className="sf-user-form-message sf-user-form-error">
                    <FiAlertCircle />
                    <span>{serverError || "User not found."}</span>
                </div>

                <button
                    className="sf-user-form-cancel-button"
                    onClick={handleBack}
                    type="button"
                >
                    <FiArrowLeft />
                    Back to Users
                </button>
            </div>
        );
    }

    const roleName =
        user.userTypeId?.name ||
        user.userType ||
        user.role ||
        "Not available";

    const organizationName = getOrganizationName(user, organizations);

    const branchName =
    user.organizationType === "Branch"
        ? organizationName
        : user.branchId?.name ||
          (user.branchId ? getId(user.branchId) : "Not assigned");

    return (
        <div className="sf-user-form-page">
            <div className="sf-user-form-page-header">
                <div className="sf-user-form-heading">
                    <button
                        className="sf-user-form-back-button"
                        onClick={handleBack}
                        type="button"
                        title="Back to Users"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Edit User</h1>
                        <p>
                            Update the user's basic information.
                        </p>
                    </div>
                </div>
            </div>

            <div className="sf-user-form-card">
                <div className="sf-user-form-card-header">
                    <div>
                        <h2>User Information</h2>
                        <p>
                            Only basic account details can be modified.
                            Role and organization details are read-only.
                        </p>
                    </div>
                </div>

                {serverError && (
                    <div className="sf-user-form-message sf-user-form-error">
                        <FiAlertCircle />
                        <span>{serverError}</span>
                    </div>
                )}

                {success && (
                    <div className="sf-user-form-message sf-user-form-success">
                        <FiCheckCircle />
                        <span>{success}</span>
                    </div>
                )}

                <form
                    className="sf-user-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="sf-user-form-section">
                        <h3>Editable Account Details</h3>
                        <p>
                            You can update the following information.
                        </p>
                    </div>

                    <div className="sf-user-form-grid">
                        <div className="sf-user-form-group">
                            <label>
                                Full Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={saving}
                                className={
                                    errors.name ? "sf-user-input-error" : ""
                                }
                            />

                            {errors.name && (
                                <small className="sf-user-field-error">
                                    {errors.name}
                                </small>
                            )}
                        </div>

                        <div className="sf-user-form-group">
                            <label>Username</label>
                            <div className="sf-user-readonly-value">
                                {user.username || "Not available"}
                            </div>
                            <small className="sf-user-field-hint">
                                Username cannot be changed.
                            </small>
                        </div>

                        <div className="sf-user-form-group">
                            <label>
                                Email Address <span>*</span>
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={saving}
                                className={
                                    errors.email ? "sf-user-input-error" : ""
                                }
                            />

                            {errors.email && (
                                <small className="sf-user-field-error">
                                    {errors.email}
                                </small>
                            )}
                        </div>

                        <div className="sf-user-form-group">
                            <label>
                                Phone Number <span>*</span>
                            </label>

                            <input
                                type="tel"
                                name="phoneNo"
                                value={formData.phoneNo}
                                onChange={handleChange}
                                maxLength={10}
                                disabled={saving}
                                className={
                                    errors.phoneNo ? "sf-user-input-error" : ""
                                }
                            />

                            {errors.phoneNo && (
                                <small className="sf-user-field-error">
                                    {errors.phoneNo}
                                </small>
                            )}
                        </div>

                        <div className="sf-user-form-group sf-user-form-full">
                            <label>Address</label>

                            <textarea
                                name="address"
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="sf-user-form-section">
                        <h3>Role & Organization</h3>
                        <p>
                            These details are displayed for reference and cannot be edited here.
                        </p>
                    </div>

                    <div className="sf-user-form-grid">
                        <ReadOnlyField
                            label="User Role"
                            value={roleName}
                        />

                        <ReadOnlyField
                            label="Organization Type"
                            value={user.organizationType}
                        />

                        <ReadOnlyField
                            label="Organization"
                            value={organizationName}
                        />

                        <ReadOnlyField
                            label="Branch Assignment"
                            value={branchName}
                        />

                        <ReadOnlyField
                            label="Account Status"
                            value={user.status}
                        />

                        <ReadOnlyField
                            label="Registration Source"
                            value={user.registrationSource}
                        />

                        <ReadOnlyField
                            label="Email Verified At"
                            value={formatDate(user.emailVerifiedAt)}
                        />

                        <ReadOnlyField
                            label="Account Created"
                            value={formatDate(user.createdAt)}
                        />

                        <ReadOnlyField
                            label="Last Updated"
                            value={formatDate(user.updatedAt)}
                        />
                    </div>

                    <div className="sf-user-form-info">
                        <FiShield />
                        <span>
                            User role, username, organization assignment,
                            and account permissions cannot be changed from
                            this page.
                        </span>
                    </div>

                    <div className="sf-user-form-footer">
                        <button
                            type="button"
                            className="sf-user-form-cancel-button"
                            onClick={handleBack}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sf-user-form-save-button"
                            disabled={saving}
                        >
                            <FiSave />
                            <span>
                                {saving ? "Saving Changes..." : "Save Changes"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUser;
