export const calculateRiskScore = (businessData) => {
    let score = 0;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (businessData.businessStartDate > oneYearAgo) {
        score += 30;
    }

    if (businessData.turnover < 500000) {
        score += 20;
    }

    const highRiskStates = ['07', '09', '10', '19', '18'];
    if (highRiskStates.includes(businessData.stateCode)) {
        score += 10;
    }

    if (businessData.legalNameMismatch) {
        score += 30;
    }

    let level = 'LOW';
    if (score > 60) {
        level = 'HIGH';
    } else if (score > 30) {
        level = 'MEDIUM';
    }

    return { score, level };
};
