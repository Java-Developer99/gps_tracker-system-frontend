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
import { useNavigate } from "react-router-dom";

import "../../css/SubDealerAdd.css";

import { addSubDealer } from "../../services/subDealerService";
import { getDealers } from "../../services/dealerService";

function SubDealerAdd() {
    const navigate = useNavigate();

    const [dealers, setDealers] = useState([]);

    const [formData, setFormData] = useState({
        dealerId: "",
        name: "",
        contactNo: "",
        email: "",
        address: "",
    });

    const [loadingDealers, setLoadingDealers] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDealers();
    }, []);

    const fetchDealers = async () => {
        try {
            setLoadingDealers(true);
            setError("");

            const data = await getDealers();

            setDealers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching dealers:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load dealers. Please try again."
            );
        } finally {
            setLoadingDealers(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.dealerId) {
            setError("Please select a dealer.");
            return;
        }

        if (!formData.name.trim()) {
            setError("SubDealer name is required.");
            return;
        }

        if (!formData.contactNo.trim()) {
            setError("Contact number is required.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!formData.address.trim()) {
            setError("Address is required.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                dealerId: formData.dealerId,
                name: formData.name.trim(),
                contactNo: formData.contactNo.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
            };

            await addSubDealer(payload);

            navigate("/subdealers");
        } catch (err) {
            console.error("Error adding SubDealer:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to add SubDealer. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="sf-subdealer-add-page">

            {/* PAGE HEADER */}
            <div className="sf-subdealer-add-header">

                <div className="sf-subdealer-add-header-left">

                    <button
                        type="button"
                        className="sf-subdealer-add-back-button"
                        onClick={() => navigate("/subdealers")}
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Add SubDealer</h1>

                        <p>
                            Create a new SubDealer and assign it to a dealer.
                        </p>
                    </div>

                </div>

            </div>


            {/* FORM CARD */}
            <div className="sf-subdealer-add-card">

                <div className="sf-subdealer-add-card-header">

                    <div>
                        <h2>SubDealer Information</h2>

                        <span>
                            Enter the details below to create a new SubDealer.
                        </span>
                    </div>

                </div>


                <form onSubmit={handleSubmit}>

                    {/* ERROR */}
                    {error && (
                        <div className="sf-subdealer-add-error">
                            {error}
                        </div>
                    )}


                    <div className="sf-subdealer-add-form">


                        {/* DEALER */}
                        <div className="sf-subdealer-add-field">

                            <label htmlFor="dealerId">
                                Dealer <span>*</span>
                            </label>

                            <div className="sf-subdealer-add-input-wrapper">

                                <FiBriefcase />

                                <select
                                    id="dealerId"
                                    name="dealerId"
                                    value={formData.dealerId}
                                    onChange={handleChange}
                                    disabled={loadingDealers || saving}
                                >
                                    <option value="">
                                        {loadingDealers
                                            ? "Loading dealers..."
                                            : "Select Dealer"}
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
                        <div className="sf-subdealer-add-field">

                            <label htmlFor="name">
                                SubDealer Name <span>*</span>
                            </label>

                            <div className="sf-subdealer-add-input-wrapper">

                                <FiUser />

                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter SubDealer name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* CONTACT */}
                        <div className="sf-subdealer-add-field">

                            <label htmlFor="contactNo">
                                Contact Number <span>*</span>
                            </label>

                            <div className="sf-subdealer-add-input-wrapper">

                                <FiPhone />

                                <input
                                    id="contactNo"
                                    type="tel"
                                    name="contactNo"
                                    placeholder="Enter contact number"
                                    value={formData.contactNo}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* EMAIL */}
                        <div className="sf-subdealer-add-field">

                            <label htmlFor="email">
                                Email <span>*</span>
                            </label>

                            <div className="sf-subdealer-add-input-wrapper">

                                <FiMail />

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* ADDRESS */}
                        <div className="sf-subdealer-add-field sf-subdealer-add-field-full">

                            <label htmlFor="address">
                                Address <span>*</span>
                            </label>

                            <div className="sf-subdealer-add-input-wrapper sf-subdealer-add-textarea-wrapper">

                                <FiMapPin />

                                <textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter SubDealer address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={saving}
                                    rows={4}
                                />

                            </div>

                        </div>

                    </div>


                    {/* FORM FOOTER */}
                    <div className="sf-subdealer-add-footer">

                        <button
                            type="button"
                            className="sf-subdealer-add-cancel-button"
                            onClick={() => navigate("/subdealers")}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sf-subdealer-add-save-button"
                            disabled={saving || loadingDealers}
                        >
                            <FiSave />

                            {saving ? "Saving..." : "Save SubDealer"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default SubDealerAdd;