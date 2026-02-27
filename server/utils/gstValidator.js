export const validateGST = (gstNumber) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
        return { isValid: false };
    }

    const stateCode = gstNumber.substring(0, 2);
    const panNumber = gstNumber.substring(2, 12);

    return { isValid: true, stateCode, panNumber };
};
