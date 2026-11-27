import React, { useEffect, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiMoreVertical,
    FiEye,
    FiEdit2,
    FiPower,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getCompanies, updateCompanyStatus } from "../../services/companyService";
import "../../css/CompanyList.css";
import { usePermission } from "../../context/PermissionContext";

function CompanyList() {
    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading
    } = usePermission();

    const canViewCompanies =
        !permissionsLoading && hasPermission("Company", "canView");

    const canAddCompanies =
        !permissionsLoading && hasPermission("Company", "canAdd");

    const canEditCompanies =
        !permissionsLoading && hasPermission("Company", "canEdit");

    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [error, setError] = useState("");
    const isWebMaster =
        localStorage.getItem("role") === "WebMaster";

    const canManageCompanyStatus =
        isWebMaster && canEditCompanies;

    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const fetchCompanies = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getCompanies();

            const normalizedCompanies = Array.isArray(data)
                ? data.map((company) => ({
                    id: company._id,
                    name: company.name || "",
                    gstNo: company.gstNo || "",
                    address: company.address || "",
                    status: company.status || "inactive",

                    subDealerId:
                        company.subDealerId &&
                            typeof company.subDealerId === "object"
                            ? company.subDealerId._id
                            : company.subDealerId || "",

                    subDealerName:
                        company.subDealerId &&
                            typeof company.subDealerId === "object"
                            ? company.subDealerId.name || ""
                            : "",


                    createdAt: company.createdAt,
                    updatedAt: company.updatedAt,
                }))
                : [];

            setCompanies(normalizedCompanies);
        } catch (err) {
            console.error("Error fetching companies:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load companies."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!permissionsLoading && canViewCompanies) {
            fetchCompanies();
        }
    }, [permissionsLoading, canViewCompanies]);

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuId(null);
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);
    const filteredCompanies = companies.filter((company) => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return true;
        }

        return (
            company.name.toLowerCase().includes(search) ||
            company.gstNo.toLowerCase().includes(search) ||
            company.address.toLowerCase().includes(search) ||
            company.subDealerName.toLowerCase().includes(search)
        );
    });

    const handleRefresh = async () => {
        setSearchTerm("");
        setOpenMenuId(null);
        await fetchCompanies(true);
    };

    const handleMenuClick = (event, id) => {
        event.stopPropagation();

        setOpenMenuId((previous) =>
            previous === id ? null : id
        );
    };

    const handleView = (id) => {
        setOpenMenuId(null);
        navigate(`/companies/${id}`);
    };

    const handleEdit = (id) => {
        setOpenMenuId(null);
        navigate(`/companies/edit/${id}`);
    };

    const handleStatusChange = async (company) => {
        if (!canManageCompanyStatus) {
            return;
        }

        const newStatus =
            company.status === "active" ? "inactive" : "active";

        const actionText =
            newStatus === "active" ? "Activate" : "Deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} ${company.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingStatusId(company.id);
            setError("");

            await updateCompanyStatus(company.id, newStatus);

            await fetchCompanies(true);
        } catch (err) {
            console.error("Error updating company status:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update company status."
            );
        } finally {
            setUpdatingStatusId(null);
        }
    };

    if (permissionsLoading) {
        return (
            <div className="sf-company-list-page">
                <div className="sf-company-list-loading">
                    <span>Checking permissions...</span>
                </div>
            </div>
        );
    }

    if (!canViewCompanies) {
        return (
            <div className="sf-company-list-page">
                <div className="sf-company-list-loading">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to view Companies.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="sf-company-list-page">
                <div className="sf-company-list-loading">
                    <div className="sf-company-list-spinner"></div>
                    <span>Loading companies...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="sf-company-list-page">

            {/* PAGE HEADER */}
            <div className="sf-company-list-page-header">
                <div>
                    <h1>Companies</h1>
                    <p>
                        Manage companies under your subdealer hierarchy.
                    </p>
                </div>

                {canAddCompanies && (

                    <button
                        type="button"
                        className="sf-company-add-button"
                        onClick={() => navigate("/companies/add")}
                    >
                        <FiPlus />
                        <span>Add Company</span>
                    </button>
                )}
            </div>

            {/* ERROR */}
            {error && (
                <div className="sf-company-list-error">
                    {error}
                </div>
            )}

            {/* TOOLBAR */}
            <div className="sf-company-list-toolbar">

                <div className="sf-company-search-wrapper">
                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />
                </div>

                <button
                    type="button"
                    className="sf-company-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh"
                >
                    <FiRefreshCw
                        className={
                            refreshing
                                ? "sf-company-refresh-spin"
                                : ""
                        }
                    />
                    <span>Refresh</span>
                </button>

            </div>

            {/* TABLE CARD */}
            <div className="sf-company-table-card">

                <div className="sf-company-table-header">
                    <div>
                        <h2>All Companies</h2>
                        <p>
                            {filteredCompanies.length}{" "}
                            {filteredCompanies.length === 1
                                ? "company"
                                : "companies"}
                        </p>
                    </div>
                </div>

                <div className="sf-company-table-wrapper">

                    <table className="sf-company-table">

                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>SubDealer</th>
                                <th>GST Number</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th className="sf-company-actions-heading">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredCompanies.length > 0 ? (
                                filteredCompanies.map(
                                    (company, index) => (
                                        <tr
                                            key={company.id}
                                            className={
                                                openMenuId === company.id &&
                                                    index >=
                                                    filteredCompanies.length - 2
                                                    ? "sf-company-menu-up"
                                                    : ""
                                            }
                                        >

                                            {/* COMPANY */}
                                            <td>
                                                <div className="sf-company-identity">

                                                    <div className="sf-company-avatar">
                                                        {company.name
                                                            .charAt(0)
                                                            .toUpperCase() || "C"}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {company.name ||
                                                                "—"}
                                                        </strong>

                                                        <span>
                                                            Company
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            {/* SUBDEALER */}
                                            <td>
                                                <div className="sf-company-subdealer">
                                                    {company.subDealerName ||
                                                        "—"}
                                                </div>
                                            </td>

                                            {/* GST */}
                                            <td>
                                                <div className="sf-company-gst">
                                                    {company.gstNo || "—"}
                                                </div>
                                            </td>

                                            {/* ADDRESS */}
                                            <td>
                                                <div className="sf-company-address">
                                                    {company.address || "—"}
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`sf-dealer-status-badge ${company.status?.toLowerCase() === "active"
                                                        ? "active"
                                                        : "inactive"
                                                        }`}
                                                >
                                                    <span className="sf-dealer-status-dot"></span>

                                                    {company.status?.toLowerCase() === "active"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="sf-company-actions-cell">

                                                <button
                                                    type="button"
                                                    className="sf-company-menu-button"
                                                    onClick={(event) =>
                                                        handleMenuClick(
                                                            event,
                                                            company.id
                                                        )
                                                    }
                                                >
                                                    <FiMoreVertical />
                                                </button>

                                                {openMenuId === company.id && (
                                                    <div
                                                        className="sf-company-action-menu"
                                                        onClick={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                    >
                                                        {canViewCompanies && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleView(
                                                                        company.id
                                                                    )
                                                                }
                                                            >
                                                                <FiEye />
                                                                <span>
                                                                    View
                                                                </span>
                                                            </button>
                                                        )}

                                                        {canEditCompanies && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        company.id
                                                                    )
                                                                }
                                                            >
                                                                <FiEdit2 />
                                                                <span>
                                                                    Edit
                                                                </span>
                                                            </button>
                                                        )}

                                                        {canManageCompanyStatus && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusChange(company)}
                                                                disabled={updatingStatusId === company.id}
                                                            >
                                                                <FiPower />
                                                                <span>
                                                                    {updatingStatusId === company.id
                                                                        ? "Updating..."
                                                                        : company.status === "active"
                                                                            ? "Deactivate"
                                                                            : "Activate"}
                                                                </span>
                                                            </button>
                                                        )}

                                                    </div>
                                                )}

                                            </td>

                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="sf-company-empty-cell"
                                    >
                                        <div className="sf-company-empty">

                                            <div className="sf-company-empty-icon">
                                                C
                                            </div>

                                            <h3>
                                                No companies found
                                            </h3>

                                            <p>
                                                Try changing your search
                                                or add a new company.
                                            </p>

                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CompanyList;