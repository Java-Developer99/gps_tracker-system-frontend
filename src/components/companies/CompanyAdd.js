import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiGitBranch,
    FiFileText,
    FiMapPin,
    FiHome,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { addCompany } from "../../services/companyService";
import { getSubDealers } from "../../services/subDealerService";

import "../../css/CompanyForm.css";

function CompanyAdd() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subDealerId: "",
        name: "",
        gstNo: "",
        address: "",
    });

    const [subDealers, setSubDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let mounted = true;

        const fetchSubDealers = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getSubDealers();

                if (!mounted) return;

                setSubDealers(
                    Array.isArray(data) ? data : []
                );
            } catch (err) {
                console.error(
                    "Error loading subdealers:",
                    err
                );

                if (mounted) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load subdealers."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchSubDealers();

        return () => {
            mounted = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const subDealerId = formData.subDealerId.trim();
        const name = formData.name.trim();
        const gstNo = formData.gstNo.trim();
        const address = formData.address.trim();

        if (!subDealerId) {
            setError("Please select a subdealer.");
            return;
        }

        if (!name) {
            setError("Please enter company name.");
            return;
        }

        try {
            setSaving(true);

            await addCompany({
                subDealerId,
                name,
                gstNo,
                address,
            });

            setSuccess("Company added successfully.");

            setTimeout(() => {
                navigate("/companies");
            }, 700);
        } catch (err) {
            console.error(
                "Error adding company:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to add company."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate("/companies");
    };

    return (
        <div className="sf-company-form-page">

            {/* HEADER */}

            <div className="sf-company-form-page-header">

                <div className="sf-company-form-heading">

                    <button
                        type="button"
                        className="sf-company-form-back-button"
                        onClick={handleCancel}
                        title="Back to Companies"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Add Company</h1>
                        <p>
                            Create a new company under a subdealer.
                        </p>
                    </div>

                </div>

            </div>

            {/* FORM */}

            <form
                className="sf-company-form-card"
                onSubmit={handleSubmit}
            >

                <div className="sf-company-form-card-header">
                    <div>
                        <h2>Company Information</h2>
                        <p>
                            Enter the company details below.
                        </p>
                    </div>
                </div>

                <div className="sf-company-form">

                    {/* SUBDEALER */}

                    <div className="sf-company-form-field">

                        <label htmlFor="subDealerId">
                            SubDealer <span>*</span>
                        </label>

                        <div className="sf-company-form-input-wrapper">

                            <FiGitBranch />

                            <select
                                id="subDealerId"
                                name="subDealerId"
                                value={formData.subDealerId}
                                onChange={handleChange}
                                disabled={
                                    loading || saving
                                }
                            >
                                <option value="">
                                    {loading
                                        ? "Loading SubDealers..."
                                        : "Select SubDealer"}
                                </option>

                                {subDealers.map(
                                    (subDealer) => (
                                        <option
                                            key={subDealer._id}
                                            value={subDealer._id}
                                        >
                                            {subDealer.name}
                                        </option>
                                    )
                                )}
                            </select>

                        </div>

                    </div>

                    {/* COMPANY NAME */}

                    <div className="sf-company-form-field">

                        <label htmlFor="name">
                            Company Name <span>*</span>
                        </label>

                        <div className="sf-company-form-input-wrapper">

                            <FiHome />

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter company name"
                                disabled={saving}
                            />

                        </div>

                    </div>

                    {/* GST */}

                    <div className="sf-company-form-field">

                        <label htmlFor="gstNo">
                            GST Number
                        </label>

                        <div className="sf-company-form-input-wrapper">

                            <FiFileText />

                            <input
                                id="gstNo"
                                type="text"
                                name="gstNo"
                                value={formData.gstNo}
                                onChange={handleChange}
                                placeholder="Enter GST number"
                                disabled={saving}
                            />

                        </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="sf-company-form-field sf-company-form-field-full">

                        <label htmlFor="address">
                            Address
                        </label>

                        <div className="sf-company-form-input-wrapper sf-company-form-textarea-wrapper">

                            <FiMapPin />

                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter company address"
                                rows="4"
                                disabled={saving}
                            />

                        </div>

                    </div>

                </div>

                {/* MESSAGES */}

                {error && (
                    <div className="sf-company-form-message sf-company-form-error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="sf-company-form-message sf-company-form-success-message">
                        {success}
                    </div>
                )}

                {/* FOOTER */}

                <div className="sf-company-form-footer">

                    <button
                        type="button"
                        className="sf-company-form-cancel-button"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="sf-company-form-save-button"
                        disabled={saving || loading}
                    >
                        <FiSave />

                        <span>
                            {saving
                                ? "Saving..."
                                : "Save Company"}
                        </span>
                    </button>

                </div>

            </form>

        </div>
    );
}

export default CompanyAdd;