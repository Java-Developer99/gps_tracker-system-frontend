
import React, { useEffect, useMemo, useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiAlertCircle,
    FiCheckCircle,
    FiShield,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { addUser, getUserById } from "../../services/userService";
import { getUserTypes } from "../../services/userTypeService";
import { getDealers } from "../../services/dealerService";
import { getSubDealers } from "../../services/subDealerService";
import { getCompanies } from "../../services/companyService";
import { getBranches } from "../../services/branchService";

import { usePermission } from "../../context/PermissionContext";

import "../../css/UserForm.css";
import "../../css/AccessDenied.css";

const ALLOWED_ROLES = {
    WebMaster: ["Web Admin", "Admin", "Manager", "End User"],
    "Web Admin": ["Admin", "Manager", "End User"],
    Admin: ["Manager", "End User"],
    Manager: ["End User"],
    "End User": [],
};

const ORGANIZATION_TYPES = ["Dealer", "SubDealer", "Company", "Branch"];

const getId = (value) => {
    if (!value) return "";
    return String(value._id || value);
};

const isActive = (item) => {
    return !item.status || item.status === "active";
};

const getTokenUserId = () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) return null;

        const payload = token.split(".")[1];
        const normalized = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = JSON.parse(atob(normalized));

        return decoded.userId || null;
    } catch (error) {
        console.error("Unable to read logged-in user ID:", error);
        return null;
    }
};

function AddUser() {
    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading,
    } = usePermission();

    const canAddUsers =
        !permissionsLoading && hasPermission("User", "canAdd");

    const [currentUser, setCurrentUser] = useState(null);
    const [userTypes, setUserTypes] = useState([]);

    const [dealers, setDealers] = useState([]);
    const [subDealers, setSubDealers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);

    const [formData, setFormData] = useState({
        userTypeId: "",
        organizationType: "",
        organizationId: "",
        branchId: "",
        name: "",
        username: "",
        phoneNo: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");

    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const requesterRole = localStorage.getItem("role") || "";

    const handleBack = () => {
        navigate("/users");
    };

    // Load current user, roles and organization records.
    useEffect(() => {
        if (permissionsLoading || !canAddUsers) {
            return;
        }

        let mounted = true;

        const loadFormData = async () => {
            setLoadingData(true);
            setServerError("");

            try {
                const userId = getTokenUserId();

                if (!userId) {
                    throw new Error(
                        "Unable to identify the logged-in user. Please sign in again."
                    );
                }

                const results = await Promise.allSettled([
                    getUserById(userId),
                    getUserTypes(),
                    getDealers(),
                    getSubDealers(),
                    getCompanies(),
                    getBranches(),
                ]);

                if (!mounted) return;

                const [
                    currentUserResult,
                    userTypesResult,
                    dealersResult,
                    subDealersResult,
                    companiesResult,
                    branchesResult,
                ] = results;

                if (currentUserResult.status === "rejected") {
                    throw currentUserResult.reason;
                }

                if (userTypesResult.status === "rejected") {
                    throw userTypesResult.reason;
                }

                const loggedInUser = currentUserResult.value;
                const roles = userTypesResult.value;

                if (!Array.isArray(roles)) {
                    throw new Error("Unable to load user roles.");
                }

                setCurrentUser(loggedInUser);
                setUserTypes(roles);

                setDealers(
                    dealersResult.status === "fulfilled" &&
                        Array.isArray(dealersResult.value)
                        ? dealersResult.value.filter(isActive)
                        : []
                );

                setSubDealers(
                    subDealersResult.status === "fulfilled" &&
                        Array.isArray(subDealersResult.value)
                        ? subDealersResult.value.filter(isActive)
                        : []
                );

                setCompanies(
                    companiesResult.status === "fulfilled" &&
                        Array.isArray(companiesResult.value)
                        ? companiesResult.value.filter(isActive)
                        : []
                );

                setBranches(
                    branchesResult.status === "fulfilled" &&
                        Array.isArray(branchesResult.value)
                        ? branchesResult.value.filter(isActive)
                        : []
                );

                // Report organization-list failures instead of silently
                // allowing the user to submit an incomplete selection.
                const failedLists = [
                    ["Dealers", dealersResult],
                    ["SubDealers", subDealersResult],
                    ["Companies", companiesResult],
                    ["Branches", branchesResult],
                ].filter(([, result]) => result.status === "rejected");

                if (failedLists.length > 0) {
                    console.error("Organization loading failures:", failedLists);

                    setServerError(
                        "Some organization lists could not be loaded. Check your organization viewing permissions and try again."
                    );
                }

            } catch (error) {
                console.error("Error loading Add User form:", error);

                if (mounted) {
                    setServerError(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to load Add User form."
                    );
                }
            } finally {
                if (mounted) {
                    setLoadingData(false);
                }
            }
        };

        loadFormData();

        return () => {
            mounted = false;
        };
    }, [permissionsLoading, canAddUsers]);

    // Restrict available roles according to the logged-in user's role.
    const availableRoles = useMemo(() => {
        const allowed = ALLOWED_ROLES[requesterRole] || [];

        return userTypes.filter((type) => allowed.includes(type.name));
    }, [userTypes, requesterRole]);

    // Determine which organization types the logged-in user can assign.
    const allowedOrganizationTypes = useMemo(() => {
        if (requesterRole === "WebMaster") {
            return ORGANIZATION_TYPES;
        }

        if (!currentUser?.organizationType) {
            return [];
        }

        const scope = {
            Dealer: ["Dealer", "SubDealer", "Company", "Branch"],
            SubDealer: ["SubDealer", "Company", "Branch"],
            Company: ["Company", "Branch"],
            Branch: ["Branch"],
        };

        return scope[currentUser.organizationType] || [];
    }, [currentUser, requesterRole]);

    // Filter organization lists according to the logged-in user's scope.
    const scopedOrganizations = useMemo(() => {
        if (!currentUser) {
            return {
                dealers: [],
                subDealers: [],
                companies: [],
                branches: [],
            };
        }

        if (requesterRole === "WebMaster") {
            return {
                dealers,
                subDealers,
                companies,
                branches,
            };
        }

        const requesterType = currentUser.organizationType;
        const requesterId = getId(currentUser.organizationId);

        if (!requesterType || !requesterId) {
            return {
                dealers: [],
                subDealers: [],
                companies: [],
                branches: [],
            };
        }

        if (requesterType === "Dealer") {
            const allowedSubDealers = subDealers.filter(
                (item) => getId(item.dealerId) === requesterId
            );

            const subDealerIds = allowedSubDealers.map((item) =>
                getId(item._id)
            );

            const allowedCompanies = companies.filter(
                (item) => subDealerIds.includes(getId(item.subDealerId))
            );

            const companyIds = allowedCompanies.map((item) =>
                getId(item._id)
            );

            return {
                dealers: dealers.filter(
                    (item) => getId(item._id) === requesterId
                ),
                subDealers: allowedSubDealers,
                companies: allowedCompanies,
                branches: branches.filter(
                    (item) => companyIds.includes(getId(item.companyId))
                ),
            };
        }

        if (requesterType === "SubDealer") {
            const allowedCompanies = companies.filter(
                (item) => getId(item.subDealerId) === requesterId
            );

            const companyIds = allowedCompanies.map((item) =>
                getId(item._id)
            );

            return {
                dealers: [],
                subDealers: subDealers.filter(
                    (item) => getId(item._id) === requesterId
                ),
                companies: allowedCompanies,
                branches: branches.filter(
                    (item) => companyIds.includes(getId(item.companyId))
                ),
            };
        }

        if (requesterType === "Company") {
            return {
                dealers: [],
                subDealers: [],
                companies: companies.filter(
                    (item) => getId(item._id) === requesterId
                ),
                branches: branches.filter(
                    (item) => getId(item.companyId) === requesterId
                ),
            };
        }

        if (requesterType === "Branch") {
            return {
                dealers: [],
                subDealers: [],
                companies: [],
                branches: branches.filter(
                    (item) => getId(item._id) === requesterId
                ),
            };
        }

        return {
            dealers: [],
            subDealers: [],
            companies: [],
            branches: [],
        };
    }, [
        currentUser,
        requesterRole,
        dealers,
        subDealers,
        companies,
        branches,
    ]);

    const organizationOptions = useMemo(() => {
        switch (formData.organizationType) {
            case "Dealer":
                return scopedOrganizations.dealers;

            case "SubDealer":
                return scopedOrganizations.subDealers;

            case "Company":
                return scopedOrganizations.companies;

            case "Branch":
                return scopedOrganizations.branches;

            default:
                return [];
        }
    }, [formData.organizationType, scopedOrganizations]);

    // Optional branch assignment must belong to the selected organization.
    const branchOptions = useMemo(() => {
        const selectedId = formData.organizationId;

        if (!selectedId || formData.organizationType === "Branch") {
            return [];
        }

        if (formData.organizationType === "Dealer") {
            const selectedSubDealers = subDealers.filter(
                (item) => getId(item.dealerId) === selectedId
            );

            const subDealerIds = selectedSubDealers.map((item) =>
                getId(item._id)
            );

            const selectedCompanies = companies.filter(
                (item) => subDealerIds.includes(getId(item.subDealerId))
            );

            const companyIds = selectedCompanies.map((item) =>
                getId(item._id)
            );

            return branches.filter(
                (item) => companyIds.includes(getId(item.companyId))
            );
        }

        if (formData.organizationType === "SubDealer") {
            const selectedCompanies = companies.filter(
                (item) => getId(item.subDealerId) === selectedId
            );

            const companyIds = selectedCompanies.map((item) =>
                getId(item._id)
            );

            return branches.filter(
                (item) => companyIds.includes(getId(item.companyId))
            );
        }

        if (formData.organizationType === "Company") {
            return branches.filter(
                (item) => getId(item.companyId) === selectedId
            );
        }

        return [];
    }, [
        formData.organizationType,
        formData.organizationId,
        subDealers,
        companies,
        branches,
    ]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => {
            const updated = {
                ...previous,
                [name]: value,
            };

            if (name === "organizationType") {
                updated.organizationId = "";
                updated.branchId = "";
            }

            if (name === "organizationId") {
                updated.branchId = "";
            }

            if (name === "name") {
                // Do not silently overwrite a username the user has entered.
            }

            return updated;
        });

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setServerError("");
        setSuccess("");
    };

    const validateForm = () => {
        const validationErrors = {};

        if (!formData.userTypeId) {
            validationErrors.userTypeId = "Please select a user role.";
        }

        if (!formData.organizationType) {
            validationErrors.organizationType =
                "Please select an organization type.";
        }

        if (!formData.organizationId) {
            validationErrors.organizationId =
                "Please select an organization.";
        }

        if (!formData.name.trim()) {
            validationErrors.name = "Name is required.";
        }

        if (!formData.username.trim()) {
            validationErrors.username = "Username is required.";
        } else if (!/^[a-z0-9]{4,20}$/.test(formData.username.trim().toLowerCase())) {
            validationErrors.username =
                "Use 4-20 lowercase letters and numbers without spaces.";
        }

        if (!formData.email.trim()) {
            validationErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ) {
            validationErrors.email = "Enter a valid email address.";
        }

        if (!formData.password) {
            validationErrors.password = "Password is required.";
        }

        if (!formData.confirmPassword) {
            validationErrors.confirmPassword =
                "Please confirm the password.";
        } else if (formData.password !== formData.confirmPassword) {
            validationErrors.confirmPassword = "Passwords do not match.";
        }

        if (!formData.phoneNo.trim()) {
            validationErrors.phoneNo = "Phone number is required.";
        } else if (!/^\d{10}$/.test(formData.phoneNo.trim())) {
            validationErrors.phoneNo = "Enter a valid 10-digit phone number.";
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!canAddUsers) {
            setServerError("You don't have permission to add Users.");
            return;
        }

        setServerError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                userTypeId: formData.userTypeId,
                organizationType: formData.organizationType,
                organizationId: formData.organizationId,
                name: formData.name.trim(),
                username: formData.username.trim().toLowerCase(),
                phoneNo: formData.phoneNo.trim(),
                email: formData.email.trim().toLowerCase(),
                address: formData.address.trim(),
                password: formData.password,
            };

            if (formData.branchId) {
                payload.branchId = formData.branchId;
            }

            await addUser(payload);

            setSuccess("User created successfully.");

            setTimeout(() => {
                navigate("/users");
            }, 1000);

        } catch (error) {
            console.error("Error adding user:", error);

            setServerError(
                error.response?.data?.message ||
                "Unable to create user. Please try again."
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

    if (!canAddUsers) {
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
                        You don't have permission to add Users.
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
                Loading user creation form...
            </div>
        );
    }

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
                        <h1>Add User</h1>
                        <p>
                            Create a new user and assign their role and organization.
                        </p>
                    </div>

                </div>
            </div>

            <div className="sf-user-form-card">

                <div className="sf-user-form-card-header">
                    <div>
                        <h2>User Information</h2>
                        <p>
                            Enter the account details and organization assignment below.
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

                    {/* ACCOUNT DETAILS */}

                    <div className="sf-user-form-section">
                        <h3>Account Details</h3>
                        <p>Basic information for the new user account.</p>
                    </div>

                    <div className="sf-user-form-grid">

                        <div className="sf-user-form-group">
                            <label>
                                Full Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={saving}
                                className={errors.name ? "sf-user-input-error" : ""}
                            />

                            {errors.name && (
                                <small className="sf-user-field-error">
                                    {errors.name}
                                </small>
                            )}
                        </div>

                        <div className="sf-user-form-group">
                            <label>
                                Username <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="username"
                                placeholder="Example: rahul9876"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={saving}
                                maxLength={20}
                                autoComplete="off"
                                className={errors.username ? "sf-user-input-error" : ""}
                            />

                            <small className="sf-user-field-hint">
                                Use lowercase letters and numbers. Username must also satisfy the backend name and phone-number rules.
                            </small>

                            {errors.username && (
                                <small className="sf-user-field-error">
                                    {errors.username}
                                </small>
                            )}
                        </div>

                        <div className="sf-user-form-group">
                            <label>
                                Email Address <span>*</span>
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={saving}
                                className={errors.email ? "sf-user-input-error" : ""}
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
                                placeholder="Enter 10-digit phone number"
                                value={formData.phoneNo}
                                onChange={handleChange}
                                maxLength={10}
                                disabled={saving}
                                className={errors.phoneNo ? "sf-user-input-error" : ""}
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
                                placeholder="Enter address"
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>

                    </div>

                    {/* LOGIN CREDENTIALS */}

                    <div className="sf-user-form-section">
                        <h3>Login Credentials</h3>
                        <p>Set the password for the new user.</p>
                    </div>

                    <div className="sf-user-form-grid">

                        <div className="sf-user-form-group">
                            <label>
                                Password <span>*</span>
                            </label>

                            <div className="sf-user-password-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className={errors.password ? "sf-user-input-error" : ""}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    disabled={saving}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>

                            {errors.password && (
                                <small className="sf-user-field-error">
                                    {errors.password}
                                </small>
                            )}
                        </div>

                        <div className="sf-user-form-group">
                            <label>
                                Confirm Password <span>*</span>
                            </label>

                            <div className="sf-user-password-wrap">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Re-enter password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className={
                                        errors.confirmPassword
                                            ? "sf-user-input-error"
                                            : ""
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((value) => !value)
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    disabled={saving}
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>

                            {errors.confirmPassword && (
                                <small className="sf-user-field-error">
                                    {errors.confirmPassword}
                                </small>
                            )}
                        </div>

                    </div>

                    {/* ROLE AND ORGANIZATION */}

                    <div className="sf-user-form-section">
                        <h3>Role & Organization</h3>
                        <p>
                            Assign the user's role and the organization they belong to.
                        </p>
                    </div>

                    <div className="sf-user-form-grid">

                        <div className="sf-user-form-group">
                            <label>
                                User Role <span>*</span>
                            </label>

                            <select
                                name="userTypeId"
                                value={formData.userTypeId}
                                onChange={handleChange}
                                disabled={saving}
                                className={
                                    errors.userTypeId ? "sf-user-input-error" : ""
                                }
                            >
                                <option value="">Select User Role</option>

                                {availableRoles.map((role) => (
                                    <option key={role._id} value={role._id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>

                            {errors.userTypeId && (
                                <small className="sf-user-field-error">
                                    {errors.userTypeId}
                                </small>
                            )}

                            {availableRoles.length === 0 && (
                                <small className="sf-user-field-hint">
                                    No roles are available for your account.
                                </small>
                            )}
                        </div>

                        <div className="sf-user-form-group">
                            <label>
                                Organization Type <span>*</span>
                            </label>

                            <select
                                name="organizationType"
                                value={formData.organizationType}
                                onChange={handleChange}
                                disabled={saving}
                                className={
                                    errors.organizationType
                                        ? "sf-user-input-error"
                                        : ""
                                }
                            >
                                <option value="">Select Organization Type</option>

                                {allowedOrganizationTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            {errors.organizationType && (
                                <small className="sf-user-field-error">
                                    {errors.organizationType}
                                </small>
                            )}
                        </div>

                        <div className="sf-user-form-group">
                            <label>
                                Organization <span>*</span>
                            </label>

                            <select
                                name="organizationId"
                                value={formData.organizationId}
                                onChange={handleChange}
                                disabled={
                                    saving ||
                                    !formData.organizationType ||
                                    organizationOptions.length === 0
                                }
                                className={
                                    errors.organizationId
                                        ? "sf-user-input-error"
                                        : ""
                                }
                            >
                                <option value="">
                                    {!formData.organizationType
                                        ? "Select organization type first"
                                        : `Select ${formData.organizationType}`}
                                </option>

                                {organizationOptions.map((organization) => (
                                    <option
                                        key={organization._id}
                                        value={organization._id}
                                    >
                                        {organization.name}
                                    </option>
                                ))}
                            </select>

                            {errors.organizationId && (
                                <small className="sf-user-field-error">
                                    {errors.organizationId}
                                </small>
                            )}

                            {formData.organizationType &&
                                organizationOptions.length === 0 && (
                                    <small className="sf-user-field-hint">
                                        No available organizations found for this type.
                                    </small>
                                )}
                        </div>

                        {formData.organizationType &&
                            formData.organizationType !== "Branch" &&
                            formData.organizationId && (
                                <div className="sf-user-form-group">
                                    <label>Branch Assignment (Optional)</label>

                                    <select
                                        name="branchId"
                                        value={formData.branchId}
                                        onChange={handleChange}
                                        disabled={saving}
                                    >
                                        <option value="">
                                            No specific branch
                                        </option>

                                        {branchOptions.map((branch) => (
                                            <option
                                                key={branch._id}
                                                value={branch._id}
                                            >
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>

                                    <small className="sf-user-field-hint">
                                        Optionally assign this user to a specific branch.
                                    </small>
                                </div>
                            )}

                    </div>

                    <div className="sf-user-form-info">
                        <FiShield />
                        <span>
                            The new user will automatically inherit the default permissions configured for the selected role.
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
                            disabled={saving || loadingData}
                        >
                            <FiSave />
                            <span>
                                {saving ? "Creating User..." : "Create User"}
                            </span>
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddUser;
