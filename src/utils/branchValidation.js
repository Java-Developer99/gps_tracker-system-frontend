export const validateBranch = ({
    companyId,
    name,
    address,
    contactNo,
}) => {
    const errors = {};

    if (!companyId || !companyId.trim()) {
        errors.companyId = "Please select a company.";
    }

    const trimmedName = name?.trim() || "";

    if (!trimmedName) {
        errors.name = "Please enter branch name.";
    } else if (trimmedName.length < 2) {
        errors.name = "Branch name must be at least 2 characters.";
    } else if (trimmedName.length > 100) {
        errors.name = "Branch name cannot exceed 100 characters.";
    }

    const trimmedAddress = address?.trim() || "";

    if (trimmedAddress.length > 300) {
        errors.address = "Address cannot exceed 300 characters.";
    }

    const trimmedContact = contactNo?.trim() || "";

    if (trimmedContact) {
        const contactRegex = /^[0-9]{10}$/;

        if (!contactRegex.test(trimmedContact)) {
            errors.contactNo =
                "Contact number must contain exactly 10 digits.";
        }
    }

    return errors;
};