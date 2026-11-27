
import React, { useEffect, useState } from "react";

import {
    FiArrowLeft,
    FiSave,
    FiAlertCircle,
    FiCheckCircle,
    FiShield,
} from "react-icons/fi";

import { useNavigate, useParams } from "react-router-dom";

import {
    getDeviceById,
    updateDevice,
    getManufacturers,
} from "../../services/deviceService";

import { usePermission } from "../../context/PermissionContext";

import "../../css/BranchForm.css";
import "../../css/AccessDenied.css";

function DeviceEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading,
    } = usePermission();

    const canEditDevices =
        !permissionsLoading && hasPermission("Device", "canEdit");

    const isWebMaster =
        localStorage.getItem("role") === "WebMaster";

    const canEditDevice =
        canEditDevices && isWebMaster;

    const [manufacturers, setManufacturers] = useState([]);

    const [manufacturerLoading, setManufacturerLoading] = useState(false);
    const [manufacturerLoadError, setManufacturerLoadError] = useState("");
    const [showManufacturerOptions, setShowManufacturerOptions] = useState(false);

    const [formData, setFormData] = useState({
        imei: "",
        serial_no: "",
        modelName: "",
        manufacturerName: "",
        port: "",
        dualSim: false,
        ais140: false,
        invoiceNo: "",
        vendorName: "",
        purchaseDate: "",
        status: "active",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (permissionsLoading || !canEditDevice) {
            return;
        }

        let mounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setServerError("");
                setManufacturerLoading(true);

                const [deviceResponse, manufacturersData] =
                    await Promise.all([
                        getDeviceById(id),
                        getManufacturers(),
                    ]);

                if (!mounted) return;

                const device =
                    deviceResponse.device || deviceResponse;

                const manufacturerName =
                    typeof device.manufacturerId === "object"
                        ? device.manufacturerId?.name || ""
                        : "";

                setManufacturers(
                    Array.isArray(manufacturersData)
                        ? manufacturersData
                        : []
                );

                setFormData({
                    imei: device.imei || "",
                    serial_no: device.serial_no || "",
                    modelName: device.modelName || "",
                    manufacturerName,
                    port: device.port ?? "",
                    dualSim: Boolean(device.dualSim),
                    ais140: Boolean(device.ais140),
                    invoiceNo: device.invoiceNo || "",
                    vendorName: device.vendorName || "",
                    purchaseDate: device.purchaseDate
                        ? new Date(device.purchaseDate)
                            .toISOString()
                            .slice(0, 10)
                        : "",
                    status: device.status || "active",
                });

            } catch (err) {
                console.error("Error loading device:", err);

                if (mounted) {
                    setServerError(
                        err.response?.data?.message ||
                        "Unable to load device details."
                    );
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                    setManufacturerLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };

    }, [id, permissionsLoading, canEditDevice]);

    const filteredManufacturers = manufacturers.filter((manufacturer) =>
        manufacturer.name.toLowerCase().includes(
            formData.manufacturerName.trim().toLowerCase()
        )
    );

    const exactManufacturerExists = manufacturers.some(
        (manufacturer) =>
            manufacturer.name.trim().toLowerCase() ===
            formData.manufacturerName.trim().toLowerCase()
    );

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setServerError("");
        setSuccess("");
    };

    const handleManufacturerSelect = (name) => {
        setFormData((prev) => ({
            ...prev,
            manufacturerName: name,
        }));

        setShowManufacturerOptions(false);

        setErrors((prev) => ({
            ...prev,
            manufacturerName: "",
        }));

        setServerError("");
        setSuccess("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.modelName.trim()) {
            newErrors.modelName = "Model name is required.";
        }

        if (!formData.manufacturerName.trim()) {
            newErrors.manufacturerName =
                "Manufacturer name is required.";
        }

        const numericPort = Number(formData.port);

        if (
            !String(formData.port).trim() ||
            !Number.isInteger(numericPort) ||
            numericPort < 1
        ) {
            newErrors.port = "Enter a valid positive port number.";
        }

        if (!["active", "inactive"].includes(formData.status)) {
            newErrors.status = "Select a valid device status.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!canEditDevice) {
            setServerError(
                "Only WebMaster with Device edit permission can edit devices."
            );
            return;
        }

        setServerError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                serial_no: formData.serial_no.trim(),
                modelName: formData.modelName.trim(),
                manufacturerName: formData.manufacturerName.trim(),
                port: Number(formData.port),
                dualSim: formData.dualSim,
                ais140: formData.ais140,
                invoiceNo: formData.invoiceNo.trim(),
                vendorName: formData.vendorName.trim(),
                purchaseDate: formData.purchaseDate || undefined,
                status: formData.status,
            };

            await updateDevice(id, payload);

            setSuccess("Device updated successfully.");

            setTimeout(() => {
                navigate("/device");
            }, 800);

        } catch (err) {
            console.error("Error updating device:", err);

            setServerError(
                err.response?.data?.message ||
                "Unable to update device. Please try again."
            );

        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate("/device");
    };

    if (permissionsLoading) {
        return (
            <div className="sf-access-denied-page">
                <div className="sf-access-denied-card">
                    <p>Checking permissions...</p>
                </div>
            </div>
        );
    }

    if (!canEditDevice) {
        return (
            <div className="sf-access-denied-page">
                <div className="sf-access-denied-card">

                    <div className="sf-access-denied-icon">
                        <FiShield />
                    </div>

                    <div className="sf-access-denied-label">
                        ACCESS RESTRICTED
                    </div>

                    <h1>Access Denied</h1>

                    <p>
                        Only WebMaster users with Device edit permission
                        can update device details.
                        <br />
                        Please contact your administrator if you believe
                        you should have access to this feature.
                    </p>

                    <div className="sf-access-denied-divider"></div>

                    <button
                        className="sf-access-denied-button"
                        onClick={handleBack}
                    >
                        <FiArrowLeft />
                        Back to Devices
                    </button>

                    <span className="sf-access-denied-footer">
                        SyncFleet · Access Control
                    </span>

                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="sf-branch-form-page">
                <div className="sf-branch-form-loading">
                    <div className="sf-branch-form-spinner" />
                    <span>Loading device details...</span>
                </div>
            </div>
        );
    }

    if (serverError && !formData.imei) {
        return (
            <div className="sf-branch-form-page">
                <div className="sf-branch-form-error-card">

                    <div className="sf-branch-form-error-icon">
                        !
                    </div>

                    <h2>Unable to load device</h2>

                    <p>{serverError}</p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        Back to Devices
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="sf-branch-form-page">

            <div className="sf-branch-form-page-header">
                <div className="sf-branch-form-heading">

                    <button
                        className="sf-branch-form-back-button"
                        onClick={handleBack}
                        type="button"
                        title="Back to Devices"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>
                        <h1>Edit Device</h1>
                        <p>Update device information and configuration.</p>
                    </div>

                </div>
            </div>

            <div className="sf-branch-form-card">

                <div className="sf-branch-form-card-header">
                    <div>
                        <h2>Device Information</h2>
                        <p>Update the device details below.</p>
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

                        {/* IMEI - READ ONLY */}
                        <div className="sf-branch-form-group">
                            <label>IMEI</label>

                            <input
                                type="text"
                                value={formData.imei}
                                disabled
                                readOnly
                            />
                        </div>

                        {/* MODEL NAME */}
                        <div className="sf-branch-form-group">
                            <label>
                                Model Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="modelName"
                                placeholder="Enter device model"
                                value={formData.modelName}
                                onChange={handleChange}
                                disabled={saving}
                                className={
                                    errors.modelName
                                        ? "sf-branch-form-input-error"
                                        : ""
                                }
                            />

                            {errors.modelName && (
                                <small className="sf-branch-field-error">
                                    {errors.modelName}
                                </small>
                            )}
                        </div>

                        {/* MANUFACTURER */}
                        <div className="sf-branch-form-group manufacturer-autocomplete">
                            <label>
                                Manufacturer Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="manufacturerName"
                                placeholder="Select or enter manufacturer name"
                                value={formData.manufacturerName}
                                onChange={(e) => {
                                    handleChange(e);
                                    setShowManufacturerOptions(true);
                                }}
                                onFocus={() =>
                                    setShowManufacturerOptions(true)
                                }
                                onBlur={() => {
                                    setTimeout(
                                        () => setShowManufacturerOptions(false),
                                        150
                                    );
                                }}
                                disabled={saving || manufacturerLoading}
                                autoComplete="off"
                                className={
                                    errors.manufacturerName
                                        ? "sf-branch-form-input-error"
                                        : ""
                                }
                            />

                            {showManufacturerOptions &&
                                !manufacturerLoading && (
                                    <div className="manufacturer-options">

                                        {filteredManufacturers.map(
                                            (manufacturer) => (
                                                <button
                                                    type="button"
                                                    key={manufacturer._id}
                                                    className="manufacturer-option"
                                                    onMouseDown={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    onClick={() =>
                                                        handleManufacturerSelect(
                                                            manufacturer.name
                                                        )
                                                    }
                                                >
                                                    {manufacturer.name}
                                                </button>
                                            )
                                        )}

                                        {formData.manufacturerName.trim() &&
                                            !exactManufacturerExists && (
                                                <div className="manufacturer-new-option">
                                                    + Add "{formData.manufacturerName.trim()}" as new manufacturer
                                                </div>
                                            )}

                                        {filteredManufacturers.length === 0 &&
                                            !formData.manufacturerName.trim() && (
                                                <div className="manufacturer-empty-option">
                                                    No manufacturers available.
                                                </div>
                                            )}

                                    </div>
                                )}

                            {manufacturerLoadError && (
                                <small className="sf-branch-field-error">
                                    {manufacturerLoadError}
                                </small>
                            )}

                            {errors.manufacturerName && (
                                <small className="sf-branch-field-error">
                                    {errors.manufacturerName}
                                </small>
                            )}
                        </div>

                        {/* SERIAL NUMBER */}
                        <div className="sf-branch-form-group">
                            <label>Serial Number</label>

                            <input
                                type="text"
                                name="serial_no"
                                placeholder="Enter serial number"
                                value={formData.serial_no}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>

                        {/* PORT */}
                        <div className="sf-branch-form-group">
                            <label>
                                Port <span>*</span>
                            </label>

                            <input
                                type="number"
                                name="port"
                                placeholder="Enter port number"
                                value={formData.port}
                                onChange={handleChange}
                                min="1"
                                disabled={saving}
                                className={
                                    errors.port
                                        ? "sf-branch-form-input-error"
                                        : ""
                                }
                            />

                            {errors.port && (
                                <small className="sf-branch-field-error">
                                    {errors.port}
                                </small>
                            )}
                        </div>

                        {/* INVOICE NUMBER */}
                        <div className="sf-branch-form-group">
                            <label>Invoice Number</label>

                            <input
                                type="text"
                                name="invoiceNo"
                                placeholder="Enter invoice number"
                                value={formData.invoiceNo}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>

                        {/* VENDOR NAME */}
                        <div className="sf-branch-form-group">
                            <label>Vendor Name</label>

                            <input
                                type="text"
                                name="vendorName"
                                placeholder="Enter vendor name"
                                value={formData.vendorName}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>

                        {/* PURCHASE DATE */}
                        <div className="sf-branch-form-group">
                            <label>Purchase Date</label>

                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>

                        {/* STATUS */}
                        <div className="sf-branch-form-group">
                            <label>
                                Device Status <span>*</span>
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={saving}
                                className={
                                    errors.status
                                        ? "sf-branch-form-input-error"
                                        : ""
                                }
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            {errors.status && (
                                <small className="sf-branch-field-error">
                                    {errors.status}
                                </small>
                            )}
                        </div>

                        {/* DUAL SIM */}
                        <div className="sf-branch-form-group">
                            <label>Dual SIM</label>

                            <label>
                                <input
                                    type="checkbox"
                                    name="dualSim"
                                    checked={formData.dualSim}
                                    onChange={handleChange}
                                    disabled={saving}
                                />
                                {" "}Supports Dual SIM
                            </label>
                        </div>

                        {/* AIS-140 */}
                        <div className="sf-branch-form-group">
                            <label>AIS-140</label>

                            <label>
                                <input
                                    type="checkbox"
                                    name="ais140"
                                    checked={formData.ais140}
                                    onChange={handleChange}
                                    disabled={saving}
                                />
                                {" "}AIS-140 Compliant
                            </label>
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
                                {saving ? "Updating..." : "Update Device"}
                            </span>
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default DeviceEdit;
