import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import {
    getSubDealerById,
    updateSubDealer,
} from "../../services/subDealerService";

import { getDealers } from "../../services/dealerService";

import "../../css/SubDealerEdit.css";

function SubDealerEdit() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        dealerId: "",
        name: "",
        contactNo: "",
        email: "",
        address: "",
    });

    const [dealers, setDealers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    /* =========================================
       LOAD SUBDEALER + DEALERS
    ========================================= */

    useEffect(() => {

        let mounted = true;

        const fetchData = async () => {

            try {

                setLoading(true);
                setError("");

                const [subDealerData, dealersData] = await Promise.all([
                    getSubDealerById(id),
                    getDealers(),
                ]);

                if (!mounted) {
                    return;
                }

                const dealerId =
                    subDealerData?.dealerId &&
                        typeof subDealerData.dealerId === "object"
                        ? subDealerData.dealerId._id
                        : subDealerData?.dealerId || "";

                setFormData({
                    dealerId,
                    name: subDealerData?.name || "",
                    contactNo: subDealerData?.contactNo || "",
                    email: subDealerData?.email || "",
                    address: subDealerData?.address || "",
                });

                setDealers(
                    Array.isArray(dealersData)
                        ? dealersData
                        : []
                );

            } catch (err) {

                console.error(
                    "Error loading subdealer:",
                    err
                );

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

        fetchData();

        return () => {
            mounted = false;
        };

    }, [id]);


    /* =========================================
       INPUT CHANGE
    ========================================= */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };


    /* =========================================
       SUBMIT
    ========================================= */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const dealerId = formData.dealerId.trim();
        const name = formData.name.trim();
        const contactNo = formData.contactNo.trim();
        const email = formData.email.trim();
        const address = formData.address.trim();


        /* Validation */

        if (!dealerId) {
            setError("Please select a dealer.");
            return;
        }

        if (!name) {
            setError("Please enter subdealer name.");
            return;
        }

        if (!contactNo) {
            setError("Please enter contact number.");
            return;
        }

        if (!email) {
            setError("Please enter email address.");
            return;
        }

        if (!address) {
            setError("Please enter address.");
            return;
        }


        try {

            setSaving(true);

            await updateSubDealer(id, {
                dealerId,
                name,
                contactNo,
                email,
                address,
            });

            setSuccess(
                "SubDealer updated successfully."
            );

            /*
             * Small delay so the success message
             * can be seen before returning to list.
             */
            setTimeout(() => {
                navigate("/subDealers");
            }, 700);

        } catch (err) {

            console.error(
                "Error updating subdealer:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update subdealer."
            );

        } finally {

            setSaving(false);
        }
    };


    /* =========================================
       CANCEL
    ========================================= */

    const handleCancel = () => {
        navigate("/subdealers");
    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (
            <div className="sf-subdealer-edit-page">

                <div className="sf-subdealer-edit-loading">

                    <div className="sf-subdealer-edit-spinner" />

                    <span>
                        Loading subdealer details...
                    </span>

                </div>

            </div>
        );
    }


    /* =========================================
       ERROR WITHOUT DATA
    ========================================= */

    if (error && !formData.name) {

        return (
            <div className="sf-subdealer-edit-page">

                <div className="sf-subdealer-edit-page-header">

                    <div className="sf-subdealer-edit-heading">

                        <button
                            type="button"
                            className="sf-subdealer-edit-back-button"
                            onClick={handleCancel}
                        >
                            <FiArrowLeft />
                        </button>

                        <div>

                            <h1>
                                Edit SubDealer
                            </h1>

                            <p>
                                Update subdealer information.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="sf-subdealer-edit-error-card">

                    <div className="sf-subdealer-edit-error-icon">
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
                        onClick={handleCancel}
                    >
                        Back to SubDealers
                    </button>

                </div>

            </div>
        );
    }


    return (
        <div className="sf-subdealer-edit-page">

            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <div className="sf-subdealer-edit-page-header">

                <div className="sf-subdealer-edit-heading">

                    <button
                        type="button"
                        className="sf-subdealer-edit-back-button"
                        onClick={handleCancel}
                        title="Back to SubDealers"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>

                        <h1>
                            Edit SubDealer
                        </h1>

                        <p>
                            Update subdealer information.
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================
                FORM CARD
            ====================================== */}

            <form
                className="sf-subdealer-edit-form-card"
                onSubmit={handleSubmit}
            >

                {/* CARD HEADER */}

                <div className="sf-subdealer-edit-card-header">

                    <div>

                        <h2>
                            SubDealer Information
                        </h2>

                        <p>
                            Update the details of this subdealer.
                        </p>

                    </div>

                </div>


                {/* FORM */}

                <div className="sf-subdealer-edit-form">

                    {/* DEALER */}

                    <div className="sf-subdealer-edit-field">

                        <label htmlFor="dealerId">
                            Dealer
                            <span>*</span>
                        </label>

                        <div className="sf-subdealer-edit-input-wrapper">

                            <FiBriefcase />

                            <select
                                id="dealerId"
                                name="dealerId"
                                value={formData.dealerId}
                                onChange={handleChange}
                                disabled={saving}
                            >

                                <option value="">
                                    Select Dealer
                                </option>

                                {dealers.map((dealer) => (
                                    <option
                                        key={dealer._id}
                                        value={dealer._id}
                                    >
                                        {dealer.name}
                                    </option>
                                ))}

                            </select>

                        </div>

                    </div>


                    {/* SUBDEALER NAME */}

                    <div className="sf-subdealer-edit-field">

                        <label htmlFor="name">
                            SubDealer Name
                            <span>*</span>
                        </label>

                        <div className="sf-subdealer-edit-input-wrapper">

                            <FiUser />

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter subdealer name"
                                disabled={saving}
                            />

                        </div>

                    </div>


                    {/* CONTACT */}

                    <div className="sf-subdealer-edit-field">

                        <label htmlFor="contactNo">
                            Contact Number
                            <span>*</span>
                        </label>

                        <div className="sf-subdealer-edit-input-wrapper">

                            <FiPhone />

                            <input
                                id="contactNo"
                                type="text"
                                name="contactNo"
                                value={formData.contactNo}
                                onChange={handleChange}
                                placeholder="Enter contact number"
                                disabled={saving}
                            />

                        </div>

                    </div>


                    {/* EMAIL */}

                    <div className="sf-subdealer-edit-field">

                        <label htmlFor="email">
                            Email Address
                            <span>*</span>
                        </label>

                        <div className="sf-subdealer-edit-input-wrapper">

                            <FiMail />

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                disabled={saving}
                            />

                        </div>

                    </div>


                    {/* ADDRESS */}

                    <div className="sf-subdealer-edit-field sf-subdealer-edit-field-full">

                        <label htmlFor="address">
                            Address
                            <span>*</span>
                        </label>

                        <div className="sf-subdealer-edit-input-wrapper sf-subdealer-edit-textarea-wrapper">

                            <FiMapPin />

                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                                rows="4"
                                disabled={saving}
                            />

                        </div>

                    </div>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="sf-subdealer-edit-message sf-subdealer-edit-error-message">
                        {error}
                    </div>
                )}


                {/* SUCCESS */}

                {success && (
                    <div className="sf-subdealer-edit-message sf-subdealer-edit-success-message">
                        {success}
                    </div>
                )}


                {/* FOOTER */}

                <div className="sf-subdealer-edit-form-footer">

                    <button
                        type="button"
                        className="sf-subdealer-edit-cancel-button"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="sf-subdealer-edit-save-button"
                        disabled={saving}
                    >

                        <FiSave />

                        <span>
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </span>

                    </button>

                </div>

            </form>

        </div>
    );
}

export default SubDealerEdit;