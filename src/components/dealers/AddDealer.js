import React, { useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { addDealer } from "../../services/dealerService";
import "../../css/AddDealer.css";
import { usePermission } from "../../context/PermissionContext";

function AddDealer() {

    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading
    } = usePermission();
    
    const canAddDealer =
        !permissionsLoading && hasPermission("Dealer", "canAdd");

    const [formData, setFormData] = useState({
        name: "",
        contactNo: "",
        email: "",
        address: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canAddDealer) {
            setError("You don't have permission to add dealers.");
            return;
        }

        setError("");
        setSuccess("");

        // Basic frontend validation
        if (!formData.name.trim()) {
            setError("Dealer name is required.");
            return;
        }

        if (!formData.contactNo.trim()) {
            setError("Contact number is required.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email address is required.");
            return;
        }

        if (!formData.address.trim()) {
            setError("Address is required.");
            return;
        }

        try {

            setLoading(true);

            const payload = {
                name: formData.name.trim(),
                contactNo: formData.contactNo.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
            };

            await addDealer(payload);

            setSuccess("Dealer added successfully.");

            setTimeout(() => {
                navigate("/dealers");
            }, 800);

        } catch (err) {

            console.error("Error adding dealer:", err);

            setError(
                err.response?.data?.message ||
                "Unable to add dealer. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/dealers");
    };

    if (permissionsLoading) {
        return (
            <div className="sf-add-dealer-page">
                <div className="sf-add-dealer-loading">
                    <div className="sf-add-dealer-spinner" />
                    <span>Checking permissions...</span>
                </div>
            </div>
        );
    }
    
    if (!canAddDealer) {
        return (
            <div className="sf-access-denied-page">
                <div className="sf-access-denied-card">
    
                    <div className="sf-access-denied-icon">
                        <FiShield />
                    </div>
    
                    <span className="sf-access-denied-label">
                        ACCESS RESTRICTED
                    </span>
    
                    <h2>Access Denied</h2>
    
                    <p>
                        You don't have permission to create a new dealer.
                        Please contact your administrator if you believe
                        you should have access to this feature.
                    </p>
    
                    <div className="sf-access-denied-divider"></div>
    
                    <button
                        type="button"
                        className="sf-access-denied-button"
                        onClick={() => navigate("/dealers")}
                    >
                        <FiArrowLeft />
                        <span>Back to Dealers</span>
                    </button>
    
                    <span className="sf-access-denied-footer">
                        SyncFleet · Access Control
                    </span>
    
                </div>
            </div>
        );
    }

    return (
        <div className="sf-add-dealer-page">

            {/* =========================
                PAGE HEADER
            ========================== */}

            <div className="sf-add-dealer-page-header">

                <div className="sf-add-dealer-heading">

                    <button
                        className="sf-add-dealer-back-button"
                        onClick={handleCancel}
                        type="button"
                        title="Back to Dealers"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Add Dealer</h1>

                        <p>
                            Create a new dealer and add them to your fleet hierarchy.
                        </p>
                    </div>

                </div>

            </div>


            {/* =========================
                FORM CARD
            ========================== */}

            <div className="sf-add-dealer-card">

                <div className="sf-add-dealer-card-header">

                    <div>
                        <h2>Dealer Information</h2>

                        <p>
                            Enter the basic details for the dealer.
                        </p>
                    </div>

                </div>


                <form onSubmit={handleSubmit}>

                    {/* =========================
                        ERROR / SUCCESS
                    ========================== */}

                    {error && (
                        <div className="sf-add-dealer-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="sf-add-dealer-success">
                            {success}
                        </div>
                    )}


                    {/* =========================
                        FORM GRID
                    ========================== */}

                    <div className="sf-add-dealer-form-grid">

                        {/* Dealer Name */}

                        <div className="sf-add-dealer-field">

                            <label htmlFor="name">
                                Dealer Name
                                <span>*</span>
                            </label>

                            <div className="sf-add-dealer-input-wrapper">

                                <FiUser />

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter dealer name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* Contact Number */}

                        <div className="sf-add-dealer-field">

                            <label htmlFor="contactNo">
                                Contact Number
                                <span>*</span>
                            </label>

                            <div className="sf-add-dealer-input-wrapper">

                                <FiPhone />

                                <input
                                    id="contactNo"
                                    name="contactNo"
                                    type="tel"
                                    placeholder="Enter contact number"
                                    value={formData.contactNo}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* Email */}

                        <div className="sf-add-dealer-field">

                            <label htmlFor="email">
                                Email Address
                                <span>*</span>
                            </label>

                            <div className="sf-add-dealer-input-wrapper">

                                <FiMail />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* Address */}

                        <div className="sf-add-dealer-field sf-add-dealer-full-width">

                            <label htmlFor="address">
                                Address
                                <span>*</span>
                            </label>

                            <div className="sf-add-dealer-input-wrapper sf-add-dealer-textarea-wrapper">

                                <FiMapPin />

                                <textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter dealer address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={loading}
                                    rows="4"
                                />

                            </div>

                        </div>

                    </div>


                    {/* =========================
                        FORM ACTIONS
                    ========================== */}

                    <div className="sf-add-dealer-actions">

                        <button
                            type="button"
                            className="sf-add-dealer-cancel-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sf-add-dealer-save-button"
                            disabled={loading}
                        >
                            <FiSave />

                            <span>
                                {loading ? "Saving..." : "Save Dealer"}
                            </span>
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddDealer;