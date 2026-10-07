import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiEdit2,
    FiFileText,
    FiMapPin,
    FiCalendar,
    FiClock,
    FiHome,
    FiGitBranch
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { getCompanyById } from "../../services/companyService";

import "../../css/CompanyView.css";

function CompanyView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const fetchCompany = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getCompanyById(id);

                if (!mounted) return;

                setCompany(data);
            } catch (err) {
                console.error(
                    "Error loading company:",
                    err
                );

                if (mounted) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load company details."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchCompany();

        return () => {
            mounted = false;
        };
    }, [id]);

    const handleBack = () => {
        navigate("/companies");
    };

    const handleEdit = () => {
        navigate(`/companies/edit/${id}`);
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleString(
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

    if (loading) {
        return (
            <div className="sf-company-view-page">

                <div className="sf-company-view-loading">

                    <div className="sf-company-view-spinner"></div>

                    <span>
                        Loading company details...
                    </span>

                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="sf-company-view-page">

                <div className="sf-company-view-page-header">

                    <div className="sf-company-view-heading">

                        <button
                            type="button"
                            className="sf-company-view-back-button"
                            onClick={handleBack}
                        >
                            <FiArrowLeft />
                        </button>

                        <div>
                            <h1>Company Details</h1>
                            <p>
                                View company information.
                            </p>
                        </div>

                    </div>

                </div>

                <div className="sf-company-view-error-card">

                    <div className="sf-company-view-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load company
                    </h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        Back to Companies
                    </button>

                </div>

            </div>
        );
    }

    const subDealerName =
        company?.subDealerId &&
            typeof company.subDealerId === "object"
            ? company.subDealerId.name
            : "—";

    return (
        <div className="sf-company-view-page">

            {/* HEADER */}

            <div className="sf-company-view-page-header">

                <div className="sf-company-view-heading">

                    <button
                        type="button"
                        className="sf-company-view-back-button"
                        onClick={handleBack}
                        title="Back to Companies"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Company Details</h1>
                        <p>
                            View company information.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="sf-company-view-edit-button"
                    onClick={handleEdit}
                >
                    <FiEdit2 />
                    <span>Edit Company</span>
                </button>

            </div>

            {/* PROFILE */}

            <div className="sf-company-view-profile-card">

                <div className="sf-company-view-profile">

                    <div className="sf-company-view-avatar">
                        {company?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                    </div>

                    <div className="sf-company-view-profile-info">

                        <h2>
                            {company?.name || "—"}
                        </h2>

                        <span>
                            Company
                        </span>

                    </div>

                </div>

            </div>

            {/* INFORMATION */}

            <div className="sf-company-view-grid">

                {/* BASIC INFORMATION */}

                <div className="sf-company-view-card">

                    <div className="sf-company-view-card-header">

                        <h2>
                            Basic Information
                        </h2>

                        <p>
                            Company details
                        </p>

                    </div>

                    <div className="sf-company-view-details">

                        <div className="sf-company-view-detail">

                            <div className="sf-company-view-detail-icon">
                                <FiHome />
                            </div>

                            <div>
                                <span>
                                    Company Name
                                </span>

                                <strong>
                                    {company?.name || "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="sf-company-view-detail">

                            <div className="sf-company-view-detail-icon">
                                <FiGitBranch />
                            </div>

                            <div>
                                <span>
                                    SubDealer
                                </span>

                                <strong>
                                    {subDealerName || "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="sf-company-view-detail">

                            <div className="sf-company-view-detail-icon">
                                <FiFileText />
                            </div>

                            <div>
                                <span>
                                    GST Number
                                </span>

                                <strong>
                                    {company?.gstNo || "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="sf-company-view-detail">

                            <div className="sf-company-view-detail-icon">
                                <FiMapPin />
                            </div>

                            <div>
                                <span>
                                    Address
                                </span>

                                <strong>
                                    {company?.address || "—"}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>

                {/* HIERARCHY */}

                <div className="sf-company-view-card">

                    <div className="sf-company-view-card-header">

                        <h2>
                            Fleet Hierarchy
                        </h2>

                        <p>
                            Company relationship
                        </p>

                    </div>

                    <div className="sf-company-view-hierarchy">

                        <div className="sf-company-view-hierarchy-item">

                            <div className="sf-company-view-hierarchy-icon">
                                <FiGitBranch />
                            </div>

                            <div>

                                <span>
                                    Parent SubDealer
                                </span>

                                <strong>
                                    {subDealerName || "—"}
                                </strong>

                            </div>

                        </div>

                        <div className="sf-company-view-hierarchy-line"></div>

                        <div className="sf-company-view-hierarchy-item">

                            <div className="sf-company-view-hierarchy-icon">
                                <FiHome />
                            </div>

                            <div>

                                <span>
                                    Current Level
                                </span>

                                <strong>
                                    Company
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

                {/* RECORD INFORMATION */}

                <div className="sf-company-view-card">

                    <div className="sf-company-view-card-header">

                        <h2>
                            Record Information
                        </h2>

                        <p>
                            System record details
                        </p>

                    </div>

                    <div className="sf-company-view-details">

                        <div className="sf-company-view-detail">

                            <div className="sf-company-view-detail-icon">
                                <FiCalendar />
                            </div>

                            <div>

                                <span>
                                    Created
                                </span>

                                <strong>
                                    {formatDate(
                                        company?.createdAt
                                    )}
                                </strong>

                            </div>

                        </div>

                        <div className="sf-company-view-detail">

                            <div className="sf-company-view-detail-icon">
                                <FiClock />
                            </div>

                            <div>

                                <span>
                                    Last Updated
                                </span>

                                <strong>
                                    {formatDate(
                                        company?.updatedAt
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CompanyView;