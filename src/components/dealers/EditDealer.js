import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import {
    getDealerById,
    updateDealer,
} from "../../services/dealerService";

import "../../css/AddDealer.css";

function EditDealer() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        contactNo: "",
        email: "",
        address: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
    ========================================
    LOAD DEALER
    ========================================
    */

    useEffect(() => {

        let mounted = true;

        const loadDealer = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getDealerById(id);

                if (!mounted) {
                    return;
                }

                setFormData({
                    name: data?.name || "",
                    contactNo: data?.contactNo || "",
                    email: data?.email || "",
                    address: data?.address || "",
                });

            } catch (err) {

                console.error(
                    "Error loading dealer:",
                    err
                );

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

        loadDealer();

        return () => {
            mounted = false;
        };

    }, [id]);


    /*
    ========================================
    HANDLE INPUT
    ========================================
    */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };


    /*
    ========================================
    VALIDATION
    ========================================
    */

    const validateForm = () => {

        if (!formData.name.trim()) {
            return "Dealer name is required.";
        }

        if (!formData.contactNo.trim()) {
            return "Contact number is required.";
        }

        if (!formData.email.trim()) {
            return "Email address is required.";
        }

        if (!formData.address.trim()) {
            return "Address is required.";
        }

        return "";
    };


    /*
    ========================================
    SAVE DEALER
    ========================================
    */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                contactNo: formData.contactNo.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
            };

            await updateDealer(id, payload);

            setSuccess(
                "Dealer updated successfully."
            );

            /*
             * Give the user a moment to see
             * the success message.
             */

            setTimeout(() => {
                navigate(`/dealers/${id}`);
            }, 800);

        } catch (err) {

            console.error(
                "Error updating dealer:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to update dealer. Please try again."
            );

        } finally {

            setSaving(false);

        }
    };


    /*
    ========================================
    CANCEL / BACK
    ========================================
    */

    const handleCancel = () => {
        navigate(`/dealers/${id}`);
    };


    /*
    ========================================
    LOADING
    ========================================
    */

    if (loading) {

        return (
            <div className="sf-add-dealer-page">

                <div className="sf-add-dealer-loading">

                    <div className="sf-add-dealer-spinner" />

                    <span>
                        Loading dealer details...
                    </span>

                </div>

            </div>
        );
    }


    /*
    ========================================
    ERROR WHILE LOADING
    ========================================
    */

    if (error && !formData.name && !formData.email) {

        return (
            <div className="sf-add-dealer-page">

                <div className="sf-add-dealer-page-header">

                    <div className="sf-add-dealer-heading">

                        <button
                            className="sf-add-dealer-back-button"
                            onClick={handleCancel}
                            type="button"
                        >
                            <FiArrowLeft />
                        </button>

                        <div>

                            <h1>
                                Edit Dealer
                            </h1>

                            <p>
                                Update dealer information.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="sf-add-dealer-error-card">

                    <h2>
                        Unable to load dealer
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={handleCancel}
                    >
                        Back to Dealer
                    </button>

                </div>

            </div>
        );
    }


    /*
    ========================================
    PAGE
    ========================================
    */

    return (
        <div className="sf-add-dealer-page">

            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <div className="sf-add-dealer-page-header">

                <div className="sf-add-dealer-heading">

                    <button
                        className="sf-add-dealer-back-button"
                        onClick={handleCancel}
                        type="button"
                        title="Back to Dealer"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>

                        <h1>
                            Edit Dealer
                        </h1>

                        <p>
                            Update the dealer information below.
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================
                FORM CARD
            ====================================== */}

            <div className="sf-add-dealer-card">

                <div className="sf-add-dealer-card-header">

                    <div>

                        <h2>
                            Dealer Information
                        </h2>

                        <p>
                            Update the basic details for this dealer.
                        </p>

                    </div>

                </div>


                <form onSubmit={handleSubmit}>

                    {/* =====================================
                        ERROR / SUCCESS
                    ====================================== */}

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


                    {/* =====================================
                        FORM GRID
                    ====================================== */}

                    <div className="sf-add-dealer-form-grid">

                        {/* Dealer Name */}

                        <div className="sf-add-dealer-field">

                            <label htmlFor="name">

                                Dealer Name

                                <span>
                                    *
                                </span>

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
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* Contact */}

                        <div className="sf-add-dealer-field">

                            <label htmlFor="contactNo">

                                Contact Number

                                <span>
                                    *
                                </span>

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
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* Email */}

                        <div className="sf-add-dealer-field">

                            <label htmlFor="email">

                                Email Address

                                <span>
                                    *
                                </span>

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
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* Address */}

                        <div className="sf-add-dealer-field sf-add-dealer-full-width">
                            <label htmlFor="address">
                                Address
                                <span>
                                    *
                                </span>
                            </label>

                            <div className="sf-add-dealer-input-wrapper sf-add-dealer-textarea-wrapper">
                                <FiMapPin />
                                <textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter dealer address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={saving}
                                    rows="4"
                                />
                            </div>
                        </div>
                    </div>


                    {/* =====================================
                        ACTIONS
                    ====================================== */}

                    <div className="sf-add-dealer-actions">

                        <button
                            type="button"
                            className="sf-add-dealer-cancel-button"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sf-add-dealer-save-button"
                            disabled={saving}
                        >
                            <FiSave />

                            <span>
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"
                                }
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditDealer;