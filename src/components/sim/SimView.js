import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiEdit2,
    FiSmartphone,
    FiHash,
    FiWifi,
    FiGlobe,
    FiActivity,
    FiCalendar,
    FiClock,
    FiAlertCircle,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { getSimById } from "../../services/simService";

import "../../css/SimView.css";

const SimView = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [sim, setSim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const fetchSim = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getSimById(id);

                if (!mounted) return;

                setSim(data);
            } catch (err) {
                console.error("Error fetching SIM:", err);

                if (mounted) {
                    setError(
                        err?.response?.data?.message ||
                        "Unable to load SIM details."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchSim();

        return () => {
            mounted = false;
        };
    }, [id]);

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

    const normalizedStatus =
        sim?.status?.toLowerCase() === "active"
            ? "active"
            : "inactive";

    if (loading) {
        return (
            <div className="sf-sim-view-page">
                <div className="sf-sim-view-loading">
                    <div className="sf-sim-view-spinner" />
                    <span>Loading SIM...</span>
                </div>
            </div>
        );
    }

    if (error || !sim) {
        return (
            <div className="sf-sim-view-page">
                <div className="sf-sim-view-error-card">
                    <div className="sf-sim-view-error-icon">
                        <FiAlertCircle />
                    </div>

                    <h2>Unable to load SIM</h2>

                    <p>
                        {error || "SIM record was not found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/sims")}
                    >
                        Back to SIMs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sf-sim-view-page">
            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="sf-sim-view-page-header">
                <div className="sf-sim-view-heading">
                    <button
                        type="button"
                        className="sf-sim-view-back-button"
                        onClick={() => navigate("/sims")}
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>SIM Details</h1>
                        <p>
                            View SIM card and connectivity
                            information.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="sf-sim-view-edit-button"
                    onClick={() =>
                        navigate(`/sims/edit/${id}`)
                    }
                >
                    <FiEdit2 />
                    <span>Edit SIM</span>
                </button>
            </div>

            {/* =========================
                PROFILE
            ========================= */}

            <div className="sf-sim-view-profile-card">
                <div className="sf-sim-view-profile-avatar">
                    <FiSmartphone />
                </div>

                <div className="sf-sim-view-profile-info">
                    <div className="sf-sim-view-profile-title-row">
                        <h2>{sim.simNo}</h2>

                        <span
                            className={`sf-sim-view-status-badge ${normalizedStatus === "active"
                                    ? "sf-sim-view-status-active"
                                    : "sf-sim-view-status-inactive"
                                }`}
                        >
                            {normalizedStatus === "active"
                                ? "Active"
                                : "Inactive"}
                        </span>
                    </div>

                    <p>SIM Card</p>
                </div>
            </div>

            {/* =========================
                INFORMATION GRID
            ========================= */}

            <div className="sf-sim-view-grid">
                {/* SIM INFORMATION */}
                <div className="sf-sim-view-card">
                    <div className="sf-sim-view-card-header">
                        <div className="sf-sim-view-card-icon">
                            <FiSmartphone />
                        </div>

                        <div>
                            <h3>SIM Information</h3>
                            <p>Basic SIM identification</p>
                        </div>
                    </div>

                    <div className="sf-sim-view-details">
                        <div className="sf-sim-view-detail-row">
                            <span>
                                <FiHash />
                                SIM Number
                            </span>

                            <strong>
                                {sim.simNo || "—"}
                            </strong>
                        </div>

                        <div className="sf-sim-view-detail-row">
                            <span>
                                <FiHash />
                                M2M Number
                            </span>

                            <strong>
                                {sim.m2mNo || "—"}
                            </strong>
                        </div>

                        <div className="sf-sim-view-detail-row">
                            <span>
                                <FiActivity />
                                Status
                            </span>

                            <strong
                                className={
                                    normalizedStatus ===
                                        "active"
                                        ? "sf-sim-view-value-active"
                                        : "sf-sim-view-value-inactive"
                                }
                            >
                                {normalizedStatus === "active"
                                    ? "Active"
                                    : "Inactive"}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* CONNECTIVITY */}
                <div className="sf-sim-view-card">
                    <div className="sf-sim-view-card-header">
                        <div className="sf-sim-view-card-icon">
                            <FiWifi />
                        </div>

                        <div>
                            <h3>Connectivity</h3>
                            <p>Network configuration</p>
                        </div>
                    </div>

                    <div className="sf-sim-view-details">
                        <div className="sf-sim-view-detail-row">
                            <span>
                                <FiGlobe />
                                Provider
                            </span>

                            <strong>
                                {sim.provider || "—"}
                            </strong>
                        </div>

                        <div className="sf-sim-view-detail-row">
                            <span>
                                <FiWifi />
                                APN
                            </span>

                            <strong>
                                {sim.apn || "—"}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* RECORD INFORMATION */}
                <div className="sf-sim-view-card">
                    <div className="sf-sim-view-card-header">
                        <div className="sf-sim-view-card-icon">
                            <FiCalendar />
                        </div>

                        <div>
                            <h3>Record Information</h3>
                            <p>SIM record timestamps</p>
                        </div>
                    </div>

                    <div className="sf-sim-view-details">
                        <div className="sf-sim-view-detail-row">
                            <span>
                                <FiCalendar />
                                Created
                            </span>

                            <strong>
                                {formatDate(sim.createdAt)}
                            </strong>
                        </div>

                        <div className="sf-sim-view-detail-row">
                            <span>
                                <FiClock />
                                Last Updated
                            </span>

                            <strong>
                                {formatDate(sim.updatedAt)}
                            </strong>
                        </div>

                        <div className="sf-sim-view-detail-row">
                            <span>
                                <FiHash />
                                SIM ID
                            </span>

                            <strong>
                                {sim._id || id}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimView;