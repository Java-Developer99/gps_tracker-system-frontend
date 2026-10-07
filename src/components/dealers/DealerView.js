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
    FiUsers,
    FiTruck,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { getDealerById } from "../../services/dealerService";
import "../../css/DealerView.css";

function DealerView() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [dealer, setDealer] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let mounted = true;

        const fetchDealer = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getDealerById(id);

                if (mounted) {
                    setDealer(data);
                }

            } catch (err) {

                console.error("Error loading dealer:", err);

                if (mounted) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load dealer details."
                    );
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };

        fetchDealer();

        return () => {
            mounted = false;
        };

    }, [id]);


    const handleBack = () => {
        navigate("/dealers");
    };


    const handleEdit = () => {
        navigate(`/dealers/edit/=${id}`);
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
            <div className="sf-dealer-view-page">

                <div className="sf-dealer-view-loading">

                    <div className="sf-dealer-view-spinner" />

                    <span>
                        Loading dealer details...
                    </span>

                </div>

            </div>
        );
    }


    if (error) {

        return (
            <div className="sf-dealer-view-page">

                <div className="sf-dealer-view-page-header">

                    <button
                        className="sf-dealer-view-back-button"
                        onClick={handleBack}
                        type="button"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Dealer Details</h1>
                        <p>
                            View dealer information.
                        </p>
                    </div>

                </div>


                <div className="sf-dealer-view-error-card">

                    <div className="sf-dealer-view-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load dealer
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        Back to Dealers
                    </button>

                </div>

            </div>
        );
    }


    if (!dealer) {
        return null;
    }


    const dealerName =
        dealer.name?.trim() || "Unnamed Dealer";

    const dealerInitial =
        dealerName.charAt(0).toUpperCase();


    return (
        <div className="sf-dealer-view-page">

            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <div className="sf-dealer-view-page-header">

                <div className="sf-dealer-view-heading">

                    <button
                        className="sf-dealer-view-back-button"
                        onClick={handleBack}
                        type="button"
                        title="Back to Dealers"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>

                        <h1>Dealer Details</h1>

                        <p>
                            View and manage dealer information.
                        </p>

                    </div>

                </div>


                <button
                    className="sf-dealer-view-edit-button"
                    onClick={handleEdit}
                    type="button"
                >
                    <FiEdit2 />

                    <span>
                        Edit Dealer
                    </span>
                </button>

            </div>


            {/* =====================================
                DEALER PROFILE
            ====================================== */}

            <div className="sf-dealer-view-profile-card">

                <div className="sf-dealer-view-profile">

                    <div className="sf-dealer-view-avatar">
                        {dealerInitial}
                    </div>


                    <div className="sf-dealer-view-profile-info">

                        <h2>
                            {dealerName}
                        </h2>

                        <span>
                            Dealer
                        </span>

                    </div>

                </div>

            </div>


            {/* =====================================
                INFORMATION GRID
            ====================================== */}

            <div className="sf-dealer-view-grid">

                {/* ================================
                    BASIC INFORMATION
                ================================= */}

                <section className="sf-dealer-view-card">

                    <div className="sf-dealer-view-card-header">

                        <div>

                            <h2>
                                Basic Information
                            </h2>

                            <p>
                                Dealer contact and address details.
                            </p>

                        </div>

                    </div>


                    <div className="sf-dealer-view-details">

                        {/* Name */}

                        <div className="sf-dealer-view-detail">

                            <div className="sf-dealer-view-detail-icon">
                                <FiUser />
                            </div>

                            <div>

                                <span>
                                    Dealer Name
                                </span>

                                <strong>
                                    {dealer.name || "—"}
                                </strong>

                            </div>

                        </div>


                        {/* Email */}

                        <div className="sf-dealer-view-detail">

                            <div className="sf-dealer-view-detail-icon">
                                <FiMail />
                            </div>

                            <div>

                                <span>
                                    Email Address
                                </span>

                                <strong>
                                    {dealer.email || "—"}
                                </strong>

                            </div>

                        </div>


                        {/* Contact */}

                        <div className="sf-dealer-view-detail">

                            <div className="sf-dealer-view-detail-icon">
                                <FiPhone />
                            </div>

                            <div>

                                <span>
                                    Contact Number
                                </span>

                                <strong>
                                    {dealer.contactNo || "—"}
                                </strong>

                            </div>

                        </div>


                        {/* Address */}

                        <div className="sf-dealer-view-detail">

                            <div className="sf-dealer-view-detail-icon">
                                <FiMapPin />
                            </div>

                            <div>

                                <span>
                                    Address
                                </span>

                                <strong>
                                    {dealer.address || "—"}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================================
                    FLEET HIERARCHY
                ================================= */}

                <section className="sf-dealer-view-card">

                    <div className="sf-dealer-view-card-header">

                        <div>

                            <h2>
                                Fleet Hierarchy
                            </h2>

                            <p>
                                Dealer-level fleet relationships.
                            </p>

                        </div>

                    </div>


                    <div className="sf-dealer-view-stats">

                        <div className="sf-dealer-view-stat">

                            <div className="sf-dealer-view-stat-icon">
                                <FiUsers />
                            </div>

                            <div>

                                <span>
                                    SubDealers
                                </span>

                                <strong>
                                    {dealer.subDealers ?? "—"}
                                </strong>

                            </div>

                        </div>


                        <div className="sf-dealer-view-stat">

                            <div className="sf-dealer-view-stat-icon">
                                <FiTruck />
                            </div>

                            <div>

                                <span>
                                    Vehicles
                                </span>

                                <strong>
                                    {dealer.vehicles ?? "—"}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================================
                    RECORD INFORMATION
                ================================= */}

                <section className="sf-dealer-view-card">

                    <div className="sf-dealer-view-card-header">

                        <div>

                            <h2>
                                Record Information
                            </h2>

                            <p>
                                Dealer record timestamps.
                            </p>

                        </div>

                    </div>


                    <div className="sf-dealer-view-details">

                        <div className="sf-dealer-view-detail">

                            <div className="sf-dealer-view-detail-icon">
                                <FiCalendar />
                            </div>

                            <div>

                                <span>
                                    Created
                                </span>

                                <strong>
                                    {formatDate(dealer.createdAt)}
                                </strong>

                            </div>

                        </div>


                        <div className="sf-dealer-view-detail">

                            <div className="sf-dealer-view-detail-icon">
                                <FiClock />
                            </div>

                            <div>

                                <span>
                                    Last Updated
                                </span>

                                <strong>
                                    {formatDate(dealer.updatedAt)}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default DealerView;