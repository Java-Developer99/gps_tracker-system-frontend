import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiAlertCircle,
    FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { getBranches } from "../../services/branchService";
import { addVehicle } from "../../services/vehicleService";
import { validateVehicle } from "../../utils/vehicleValidation";

import "../../css/VehicleForm.css";

const VehicleAdd = () => {
    const navigate = useNavigate();

    const [branches, setBranches] = useState([]);

    const [formData, setFormData] = useState({
        branchId: "",
        vehicleType: "",
        regNo: "",
        make: "",
        model: "",
        year: "",
        odoMeter: "",
        expiryDate: "",
        active: true,
        accessBlocked: false,
    });

    const [errors, setErrors] = useState({});
    const [loadingBranches, setLoadingBranches] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoadingBranches(true);

                const data = await getBranches();

                setBranches(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching branches:", err);

                setError(
                    err?.response?.data?.message ||
                    "Unable to load branches."
                );
            } finally {
                setLoadingBranches(false);
            }
        };

        fetchBranches();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateVehicle(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                branchId: formData.branchId,
                vehicleType: formData.vehicleType.trim(),
                regNo: formData.regNo.trim().toUpperCase(),
                make: formData.make.trim(),
                model: formData.model.trim(),
                year:
                    formData.year === ""
                        ? undefined
                        : Number(formData.year),
                odoMeter:
                    formData.odoMeter === ""
                        ? undefined
                        : Number(formData.odoMeter),
                active: formData.active,
                accessBlocked: formData.accessBlocked,
                expiryDate: formData.expiryDate || undefined,
            };

            await addVehicle(payload);

            setSuccess("Vehicle added successfully.");

            setTimeout(() => {
                navigate("/vehicles");
            }, 700);
        } catch (err) {
            console.error("Error adding vehicle:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to add vehicle. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="sf-vehicle-form-page">
            {/* PAGE HEADER */}
            <div className="sf-vehicle-form-page-header">
                <div className="sf-vehicle-form-heading">
                    <button
                        type="button"
                        className="sf-vehicle-form-back-button"
                        onClick={() => navigate("/vehicles")}
                    >
                        <FiArrowLeft size={18} />
                    </button>

                    <div>
                        <h1>Add Vehicle</h1>
                        <p>
                            Add a new vehicle to your fleet.
                        </p>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="sf-vehicle-form-message sf-vehicle-form-error">
                    <FiAlertCircle size={17} />
                    <span>{error}</span>
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div className="sf-vehicle-form-message sf-vehicle-form-success">
                    <FiCheckCircle size={17} />
                    <span>{success}</span>
                </div>
            )}

            {/* FORM CARD */}
            <div className="sf-vehicle-form-card">
                <div className="sf-vehicle-form-card-header">
                    <h2>Vehicle Information</h2>
                    <p>
                        Enter the vehicle details and assign it to a branch.
                    </p>
                </div>

                <form
                    className="sf-vehicle-form"
                    onSubmit={handleSubmit}
                >
                    <div className="sf-vehicle-form-grid">
                        {/* BRANCH */}
                        <div className="sf-vehicle-form-group">
                            <label>
                                Branch
                                <span>*</span>
                            </label>

                            <select
                                name="branchId"
                                value={formData.branchId}
                                onChange={handleChange}
                                disabled={loadingBranches || saving}
                                className={
                                    errors.branchId
                                        ? "sf-vehicle-form-input-error"
                                        : ""
                                }
                            >
                                <option value="">
                                    {loadingBranches
                                        ? "Loading branches..."
                                        : "Select branch"}
                                </option>

                                {branches.map((branch) => (
                                    <option
                                        key={branch._id}
                                        value={branch._id}
                                    >
                                        {branch.name}
                                    </option>
                                ))}
                            </select>

                            {errors.branchId && (
                                <small className="sf-vehicle-field-error">
                                    {errors.branchId}
                                </small>
                            )}
                        </div>

                        {/* VEHICLE TYPE */}
                        <div className="sf-vehicle-form-group">
                            <label>
                                Vehicle Type
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                placeholder="e.g. Bus, Truck, Car"
                                disabled={saving}
                                className={
                                    errors.vehicleType
                                        ? "sf-vehicle-form-input-error"
                                        : ""
                                }
                            />

                            {errors.vehicleType && (
                                <small className="sf-vehicle-field-error">
                                    {errors.vehicleType}
                                </small>
                            )}
                        </div>

                        {/* REGISTRATION */}
                        <div className="sf-vehicle-form-group">
                            <label>
                                Registration Number
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="regNo"
                                value={formData.regNo}
                                onChange={handleChange}
                                placeholder="e.g. MH12AB1234"
                                disabled={saving}
                                className={
                                    errors.regNo
                                        ? "sf-vehicle-form-input-error"
                                        : ""
                                }
                            />

                            {errors.regNo && (
                                <small className="sf-vehicle-field-error">
                                    {errors.regNo}
                                </small>
                            )}
                        </div>

                        {/* MAKE */}
                        <div className="sf-vehicle-form-group">
                            <label>Make</label>

                            <input
                                type="text"
                                name="make"
                                value={formData.make}
                                onChange={handleChange}
                                placeholder="e.g. Tata"
                                disabled={saving}
                                className={
                                    errors.make
                                        ? "sf-vehicle-form-input-error"
                                        : ""
                                }
                            />

                            {errors.make && (
                                <small className="sf-vehicle-field-error">
                                    {errors.make}
                                </small>
                            )}
                        </div>

                        {/* MODEL */}
                        <div className="sf-vehicle-form-group">
                            <label>Model</label>

                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="e.g. Starbus"
                                disabled={saving}
                                className={
                                    errors.model
                                        ? "sf-vehicle-form-input-error"
                                        : ""
                                }
                            />

                            {errors.model && (
                                <small className="sf-vehicle-field-error">
                                    {errors.model}
                                </small>
                            )}
                        </div>

                        {/* YEAR */}
                        <div className="sf-vehicle-form-group">
                            <label>Manufacturing Year</label>

                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                placeholder="e.g. 2025"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                disabled={saving}
                                className={
                                    errors.year
                                        ? "sf-vehicle-form-input-error"
                                        : ""
                                }
                            />

                            {errors.year && (
                                <small className="sf-vehicle-field-error">
                                    {errors.year}
                                </small>
                            )}
                        </div>

                        {/* ODOMETER */}
                        <div className="sf-vehicle-form-group">
                            <label>Odometer (km)</label>

                            <input
                                type="number"
                                name="odoMeter"
                                value={formData.odoMeter}
                                onChange={handleChange}
                                placeholder="e.g. 12500"
                                min="0"
                                disabled={saving}
                                className={
                                    errors.odoMeter
                                        ? "sf-vehicle-form-input-error"
                                        : ""
                                }
                            />

                            {errors.odoMeter && (
                                <small className="sf-vehicle-field-error">
                                    {errors.odoMeter}
                                </small>
                            )}
                        </div>

                        {/* EXPIRY DATE */}
                        <div className="sf-vehicle-form-group">
                            <label>Expiry Date</label>

                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                disabled={saving}
                                className={
                                    errors.expiryDate
                                        ? "sf-vehicle-form-input-error"
                                        : ""
                                }
                            />

                            {errors.expiryDate && (
                                <small className="sf-vehicle-field-error">
                                    {errors.expiryDate}
                                </small>
                            )}
                        </div>

                        {/* STATUS */}
                        <div className="sf-vehicle-form-group sf-vehicle-toggle-group">
                            <label>Vehicle Status</label>

                            <label className="sf-vehicle-switch-row">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                                <span className="sf-vehicle-switch"></span>

                                <span>
                                    {formData.active
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </label>
                        </div>

                        {/* ACCESS */}
                        <div className="sf-vehicle-form-group sf-vehicle-toggle-group">
                            <label>Vehicle Access</label>

                            <label className="sf-vehicle-switch-row">
                                <input
                                    type="checkbox"
                                    name="accessBlocked"
                                    checked={formData.accessBlocked}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                                <span className="sf-vehicle-switch"></span>

                                <span>
                                    {formData.accessBlocked
                                        ? "Access Blocked"
                                        : "Access Allowed"}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="sf-vehicle-form-footer">
                        <button
                            type="button"
                            className="sf-vehicle-form-cancel-button"
                            onClick={() => navigate("/vehicles")}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sf-vehicle-form-save-button"
                            disabled={saving || loadingBranches}
                        >
                            <FiSave size={16} />

                            {saving
                                ? "Saving..."
                                : "Save Vehicle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleAdd;