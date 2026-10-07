import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiEdit2,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiCalendar,
    FiClock,
    FiBriefcase,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { getSubDealerById } from "../../services/subDealerService";
import "../../css/SubDealerView.css";

function SubDealerView() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [subDealer, setSubDealer] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let mounted = true;

        const fetchSubDealer = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getSubDealerById(id);

                if (mounted) {
                    setSubDealer(data);
                }

            } catch (err) {

                console.error("Error loading subdealer:", err);

                if (mounted) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load subdealer details."
                    );
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };

        fetchSubDealer();

        return () => {
            mounted = false;
        };

    }, [id]);


    const handleBack = () => {
        navigate("/subDealers");
    };


    const handleEdit = () => {
        navigate(`/subDealer/edit/${id}`);
    };


    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

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


    if (loading) {

        return (
            <div className="sf-subdealer-view-page">

                <div className="sf-subdealer-view-loading">

                    <div className="sf-subdealer-view-spinner" />

                    <span>
                        Loading subdealer details...
                    </span>

                </div>

            </div>
        );
    }


    if (error) {

        return (
            <div className="sf-subdealer-view-page">

                <div className="sf-subdealer-view-page-header">

                    <div className="sf-subdealer-view-heading">

                        <button
                            className="sf-subdealer-view-back-button"
                            onClick={handleBack}
                            type="button"
                            title="Back to SubDealers"
                        >
                            <FiArrowLeft />
                        </button>

                        <div>

                            <h1>SubDealer Details</h1>

                            <p>
                                View subdealer information.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="sf-subdealer-view-error-card">

                    <div className="sf-subdealer-view-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load subdealer
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        Back to SubDealers
                    </button>

                </div>

            </div>
        );
    }


    if (!subDealer) {
        return null;
    }


    const subDealerName =
        subDealer.name?.trim() || "Unnamed SubDealer";


    const subDealerInitial =
        subDealerName.charAt(0).toUpperCase();


    /*
     * dealerId is populated by the backend:
     *
     * .populate("dealerId")
     *
     * So it will normally be an object here.
     */
    const dealer =
        subDealer.dealerId &&
            typeof subDealer.dealerId === "object"
            ? subDealer.dealerId
            : null;


    return (
        <div className="sf-subdealer-view-page">

            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <div className="sf-subdealer-view-page-header">

                <div className="sf-subdealer-view-heading">

                    <button
                        className="sf-subdealer-view-back-button"
                        onClick={handleBack}
                        type="button"
                        title="Back to SubDealers"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>

                        <h1>SubDealer Details</h1>

                        <p>
                            View and manage subdealer information.
                        </p>

                    </div>

                </div>


                {/* TOP RIGHT EDIT BUTTON */}

                <button
                    className="sf-subdealer-view-edit-button"
                    onClick={handleEdit}
                    type="button"
                >
                    <FiEdit2 />

                    <span>
                        Edit SubDealer
                    </span>
                </button>

            </div>


            {/* =====================================
                SUBDEALER PROFILE
            ====================================== */}

            <div className="sf-subdealer-view-profile-card">

                <div className="sf-subdealer-view-profile">

                    <div className="sf-subdealer-view-avatar">
                        {subDealerInitial}
                    </div>


                    <div className="sf-subdealer-view-profile-info">

                        <h2>
                            {subDealerName}
                        </h2>

                        <span>
                            SubDealer
                        </span>

                    </div>

                </div>

            </div>


            {/* =====================================
                INFORMATION GRID
            ====================================== */}

            <div className="sf-subdealer-view-grid">

                {/* ================================
                    BASIC INFORMATION
                ================================= */}

                <section className="sf-subdealer-view-card">

                    <div className="sf-subdealer-view-card-header">

                        <div>

                            <h2>
                                Basic Information
                            </h2>

                            <p>
                                SubDealer contact and address details.
                            </p>

                        </div>

                    </div>


                    <div className="sf-subdealer-view-details">

                        {/* Name */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiUser />
                            </div>

                            <div>

                                <span>
                                    SubDealer Name
                                </span>

                                <strong>
                                    {subDealer.name || "—"}
                                </strong>

                            </div>

                        </div>


                        {/* Email */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiMail />
                            </div>

                            <div>

                                <span>
                                    Email Address
                                </span>

                                <strong>
                                    {subDealer.email || "—"}
                                </strong>

                            </div>

                        </div>


                        {/* Contact */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiPhone />
                            </div>

                            <div>

                                <span>
                                    Contact Number
                                </span>

                                <strong>
                                    {subDealer.contactNo || "—"}
                                </strong>

                            </div>

                        </div>


                        {/* Address */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiMapPin />
                            </div>

                            <div>

                                <span>
                                    Address
                                </span>

                                <strong>
                                    {subDealer.address || "—"}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================================
                    DEALER INFORMATION
                ================================= */}

                <section className="sf-subdealer-view-card">

                    <div className="sf-subdealer-view-card-header">

                        <div>

                            <h2>
                                Dealer Information
                            </h2>

                            <p>
                                Dealer associated with this SubDealer.
                            </p>

                        </div>

                    </div>


                    <div className="sf-subdealer-view-details">

                        {/* Dealer Name */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiBriefcase />
                            </div>

                            <div>

                                <span>
                                    Dealer Name
                                </span>

                                <strong>
                                    {dealer?.name || "—"}
                                </strong>

                            </div>

                        </div>


                        {/* Dealer Email */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiMail />
                            </div>

                            <div>

                                <span>
                                    Dealer Email
                                </span>

                                <strong>
                                    {dealer?.email || "—"}
                                </strong>

                            </div>

                        </div>


                        {/* Dealer Contact */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiPhone />
                            </div>

                            <div>

                                <span>
                                    Dealer Contact
                                </span>

                                <strong>
                                    {dealer?.contactNo || "—"}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================================
                    RECORD INFORMATION
                ================================= */}

                <section className="sf-subdealer-view-card">

                    <div className="sf-subdealer-view-card-header">

                        <div>

                            <h2>
                                Record Information
                            </h2>

                            <p>
                                SubDealer record timestamps.
                            </p>

                        </div>

                    </div>


                    <div className="sf-subdealer-view-details">

                        {/* Created */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiCalendar />
                            </div>

                            <div>

                                <span>
                                    Created
                                </span>

                                <strong>
                                    {formatDate(subDealer.createdAt)}
                                </strong>

                            </div>

                        </div>


                        {/* Last Updated */}

                        <div className="sf-subdealer-view-detail">

                            <div className="sf-subdealer-view-detail-icon">
                                <FiClock />
                            </div>

                            <div>

                                <span>
                                    Last Updated
                                </span>

                                <strong>
                                    {formatDate(subDealer.updatedAt)}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default SubDealerView;