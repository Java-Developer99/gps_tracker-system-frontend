import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiAlertCircle,
    FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { addSim } from "../../services/simService";
import { validateSim } from "../../utils/simValidation";
import "../../css/SimForm.css";

const SimAdd = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        simNo: "",
        m2mNo: "",
        provider: "",
        apn: "",
        status: "active",
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setErrors({});
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        if (submitError) {
            setSubmitError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitError("");
        setSuccessMessage("");

        const validationErrors = validateSim(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setSaving(true);

            const payload = {
                simNo: formData.simNo.trim(),
                m2mNo: formData.m2mNo.trim(),
                provider: formData.provider.trim(),
                apn: formData.apn.trim(),
                status: formData.status,
            };

            await addSim(payload);

            setSuccessMessage("SIM added successfully.");

            setTimeout(() => {
                navigate("/sims");
            }, 700);
        } catch (err) {
            console.error("Error adding SIM:", err);

            setSubmitError(
                err?.response?.data?.message ||
                "Unable to add SIM. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="sf-sim-form-page">
            {/* Page Header */}
            <div className="sf-sim-form-page-header">
                <div className="sf-sim-form-heading">
                    <button
                        type="button"
                        className="sf-sim-form-back-button"
                        onClick={() => navigate("/sims")}
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Add SIM</h1>
                        <p>
                            Add a new SIM card and connectivity details.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="sf-sim-form-card">
                <div className="sf-sim-form-card-header">
                    <div>
                        <h2>SIM Information</h2>
                        <p>
                            Enter the SIM card details below.
                        </p>
                    </div>
                </div>

                {submitError && (
                    <div className="sf-sim-form-message sf-sim-form-error">
                        <FiAlertCircle />
                        <span>{submitError}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="sf-sim-form-message sf-sim-form-success">
                        <FiCheckCircle />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form
                    className="sf-sim-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="sf-sim-form-grid">
                        {/* SIM Number */}
                        <div className="sf-sim-form-group">
                            <label htmlFor="simNo">
                                SIM Number
                                <span className="sf-sim-required">
                                    *
                                </span>
                            </label>

                            <input
                                id="simNo"
                                name="simNo"
                                type="text"
                                value={formData.simNo}
                                onChange={handleChange}
                                placeholder="Enter SIM number"
                                className={
                                    errors.simNo
                                        ? "sf-sim-form-input-error"
                                        : ""
                                }
                            />

                            {errors.simNo && (
                                <span className="sf-sim-field-error">
                                    {errors.simNo}
                                </span>
                            )}
                        </div>

                        {/* M2M Number */}
                        <div className="sf-sim-form-group">
                            <label htmlFor="m2mNo">
                                M2M Number
                            </label>

                            <input
                                id="m2mNo"
                                name="m2mNo"
                                type="text"
                                value={formData.m2mNo}
                                onChange={handleChange}
                                placeholder="Enter M2M number"
                                className={
                                    errors.m2mNo
                                        ? "sf-sim-form-input-error"
                                        : ""
                                }
                            />

                            {errors.m2mNo && (
                                <span className="sf-sim-field-error">
                                    {errors.m2mNo}
                                </span>
                            )}
                        </div>

                        {/* Provider */}
                        <div className="sf-sim-form-group">
                            <label htmlFor="provider">
                                Provider
                            </label>

                            <input
                                id="provider"
                                name="provider"
                                type="text"
                                value={formData.provider}
                                onChange={handleChange}
                                placeholder="e.g. Airtel, Jio, Vi"
                                className={
                                    errors.provider
                                        ? "sf-sim-form-input-error"
                                        : ""
                                }
                            />

                            {errors.provider && (
                                <span className="sf-sim-field-error">
                                    {errors.provider}
                                </span>
                            )}
                        </div>

                        {/* APN */}
                        <div className="sf-sim-form-group">
                            <label htmlFor="apn">
                                APN
                            </label>

                            <input
                                id="apn"
                                name="apn"
                                type="text"
                                value={formData.apn}
                                onChange={handleChange}
                                placeholder="Enter APN"
                                className={
                                    errors.apn
                                        ? "sf-sim-form-input-error"
                                        : ""
                                }
                            />

                            {errors.apn && (
                                <span className="sf-sim-field-error">
                                    {errors.apn}
                                </span>
                            )}
                        </div>

                        {/* Status */}
                        <div className="sf-sim-form-group">
                            <label htmlFor="status">
                                Status
                            </label>

                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">
                                    Active
                                </option>
                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sf-sim-form-footer">
                        <button
                            type="button"
                            className="sf-sim-form-cancel-button"
                            onClick={() => navigate("/sims")}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sf-sim-form-save-button"
                            disabled={saving}
                        >
                            <FiSave />

                            <span>
                                {saving ? "Saving..." : "Save SIM"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SimAdd;