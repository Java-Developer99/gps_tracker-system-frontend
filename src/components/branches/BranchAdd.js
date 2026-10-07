import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiAlertCircle,
    FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { getCompanies } from "../../services/companyService";
import { addBranch } from "../../services/branchService";
import { validateBranch } from "../../utils/branchValidation";
import "../../css/BranchForm.css"

function BranchAdd() {

    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);

    const [formData, setFormData] = useState({
        companyId: "",
        name: "",
        address: "",
        contactNo: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {

        const fetchCompanies = async () => {

            try {

                setLoadingCompanies(true);

                const data = await getCompanies();

                setCompanies(
                    Array.isArray(data) ? data : []
                );

            } catch (err) {

                console.error("Error fetching companies:", err);

                setServerError(
                    err.response?.data?.message ||
                    "Unable to load companies."
                );

            } finally {

                setLoadingCompanies(false);

            }
        };

        fetchCompanies();

    }, []);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setServerError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setServerError("");
        setSuccess("");

        const validationErrors = validateBranch(formData);

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {

            setSaving(true);

            const payload = {
                companyId: formData.companyId.trim(),
                name: formData.name.trim(),
                address: formData.address.trim(),
                contactNo: formData.contactNo.trim(),
            };

            await addBranch(payload);

            setSuccess("Branch added successfully.");

            setTimeout(() => {
                navigate("/branches");
            }, 800);

        } catch (err) {

            console.error("Error adding branch:", err);

            setServerError(
                err.response?.data?.message ||
                "Unable to add branch. Please try again."
            );

        } finally {

            setSaving(false);

        }
    };

    const handleBack = () => {
        navigate("/branches");
    };

    return (
        <div className="sf-branch-form-page">

            <div className="sf-branch-form-page-header">

                <div className="sf-branch-form-heading">

                    <button
                        className="sf-branch-form-back-button"
                        onClick={handleBack}
                        type="button"
                        title="Back to Branches"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Add Branch</h1>

                        <p>
                            Create a new branch under a company.
                        </p>
                    </div>

                </div>

            </div>

            <div className="sf-branch-form-card">

                <div className="sf-branch-form-card-header">

                    <div>
                        <h2>Branch Information</h2>

                        <p>
                            Enter the branch details below.
                        </p>
                    </div>

                </div>

                {serverError && (
                    <div className="sf-branch-form-message sf-branch-form-error">
                        <FiAlertCircle />
                        <span>{serverError}</span>
                    </div>
                )}

                {success && (
                    <div className="sf-branch-form-message sf-branch-form-success">
                        <FiCheckCircle />
                        <span>{success}</span>
                    </div>
                )}

                <form
                    className="sf-branch-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <div className="sf-branch-form-grid">

                        {/* COMPANY */}

                        <div className="sf-branch-form-group">

                            <label>
                                Company <span>*</span>
                            </label>

                            <select
                                name="companyId"
                                value={formData.companyId}
                                onChange={handleChange}
                                disabled={loadingCompanies || saving}
                                className={
                                    errors.companyId
                                        ? "sf-branch-form-input-error"
                                        : ""
                                }
                            >

                                <option value="">
                                    {loadingCompanies
                                        ? "Loading companies..."
                                        : "Select Company"}
                                </option>

                                {companies.map((company) => (
                                    <option
                                        key={company._id}
                                        value={company._id}
                                    >
                                        {company.name}
                                    </option>
                                ))}

                            </select>

                            {errors.companyId && (
                                <small className="sf-branch-field-error">
                                    {errors.companyId}
                                </small>
                            )}

                        </div>

                        {/* BRANCH NAME */}

                        <div className="sf-branch-form-group">

                            <label>
                                Branch Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter branch name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={saving}
                                className={
                                    errors.name
                                        ? "sf-branch-form-input-error"
                                        : ""
                                }
                            />

                            {errors.name && (
                                <small className="sf-branch-field-error">
                                    {errors.name}
                                </small>
                            )}

                        </div>

                        {/* CONTACT */}

                        <div className="sf-branch-form-group">

                            <label>
                                Contact Number
                            </label>

                            <input
                                type="text"
                                name="contactNo"
                                placeholder="Enter contact number"
                                value={formData.contactNo}
                                onChange={handleChange}
                                maxLength={10}
                                disabled={saving}
                                className={
                                    errors.contactNo
                                        ? "sf-branch-form-input-error"
                                        : ""
                                }
                            />

                            {errors.contactNo && (
                                <small className="sf-branch-field-error">
                                    {errors.contactNo}
                                </small>
                            )}

                        </div>

                        {/* ADDRESS */}

                        <div className="sf-branch-form-group sf-branch-form-full">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                placeholder="Enter branch address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={4}
                                disabled={saving}
                                className={
                                    errors.address
                                        ? "sf-branch-form-input-error"
                                        : ""
                                }
                            />

                            {errors.address && (
                                <small className="sf-branch-field-error">
                                    {errors.address}
                                </small>
                            )}

                        </div>

                    </div>

                    <div className="sf-branch-form-footer">

                        <button
                            type="button"
                            className="sf-branch-form-cancel-button"
                            onClick={handleBack}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sf-branch-form-save-button"
                            disabled={saving}
                        >
                            <FiSave />

                            <span>
                                {saving
                                    ? "Saving..."
                                    : "Save Branch"}
                            </span>
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default BranchAdd;