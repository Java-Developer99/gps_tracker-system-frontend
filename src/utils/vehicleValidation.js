export const validateVehicle = ({
    branchId,
    vehicleType,
    regNo,
    make,
    model,
    year,
    odoMeter,
    expiryDate,
}) => {
    const errors = {};

    if (!branchId || !branchId.trim()) {
        errors.branchId = "Please select a branch.";
    }

    const trimmedVehicleType = vehicleType?.trim() || "";

    if (!trimmedVehicleType) {
        errors.vehicleType = "Please enter vehicle type.";
    } else if (trimmedVehicleType.length < 2) {
        errors.vehicleType = "Vehicle type must be at least 2 characters.";
    } else if (trimmedVehicleType.length > 50) {
        errors.vehicleType = "Vehicle type cannot exceed 50 characters.";
    }

    const trimmedRegNo = regNo?.trim().toUpperCase() || "";

    if (!trimmedRegNo) {
        errors.regNo = "Please enter registration number.";
    } else if (trimmedRegNo.length < 4) {
        errors.regNo = "Registration number is too short.";
    } else if (trimmedRegNo.length > 20) {
        errors.regNo = "Registration number cannot exceed 20 characters.";
    }

    const trimmedMake = make?.trim() || "";

    if (trimmedMake.length > 50) {
        errors.make = "Make cannot exceed 50 characters.";
    }

    const trimmedModel = model?.trim() || "";

    if (trimmedModel.length > 50) {
        errors.model = "Model cannot exceed 50 characters.";
    }

    if (
        year !== "" &&
        year !== null &&
        year !== undefined &&
        (!Number.isInteger(Number(year)) ||
            Number(year) < 1900 ||
            Number(year) > new Date().getFullYear() + 1)
    ) {
        errors.year = "Please enter a valid manufacturing year.";
    }

    if (
        odoMeter !== "" &&
        odoMeter !== null &&
        odoMeter !== undefined &&
        (Number.isNaN(Number(odoMeter)) || Number(odoMeter) < 0)
    ) {
        errors.odoMeter = "Odometer cannot be negative.";
    }

    if (expiryDate) {
        const selectedDate = new Date(expiryDate);

        if (Number.isNaN(selectedDate.getTime())) {
            errors.expiryDate = "Please enter a valid expiry date.";
        }
    }

    return errors;
};