export const validateSim = ({
    simNo,
    m2mNo,
    provider,
    apn,
}) => {
    const errors = {};

    const trimmedSimNo = simNo?.trim() || "";

    if (!trimmedSimNo) {
        errors.simNo = "Please enter SIM number.";
    } else if (trimmedSimNo.length < 5) {
        errors.simNo = "SIM number is too short.";
    } else if (trimmedSimNo.length > 30) {
        errors.simNo = "SIM number cannot exceed 30 characters.";
    }

    const trimmedM2mNo = m2mNo?.trim() || "";

    if (trimmedM2mNo.length > 30) {
        errors.m2mNo = "M2M number cannot exceed 30 characters.";
    }

    const trimmedProvider = provider?.trim() || "";

    if (trimmedProvider.length > 50) {
        errors.provider = "Provider cannot exceed 50 characters.";
    }

    const trimmedApn = apn?.trim() || "";

    if (trimmedApn.length > 100) {
        errors.apn = "APN cannot exceed 100 characters.";
    }

    return errors;
};