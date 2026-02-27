import { InvoiceStatus, RiskLevel } from '@prisma/client';

/**
 * Determines the final status of the invoice based on fraud and credit scores.
 * 
 * Logic:
 * - If fraudScore >= 80 -> REVIEW
 * - If creditScore < 40 -> REVIEW
 * - Else -> VERIFIED
 * 
 * @param {Object} params
 * @param {number} params.fraudScore
 * @param {number} params.creditScore
 * @returns {InvoiceStatus}
 */
export const determineInvoiceStatus = ({ fraudScore, creditScore }) => {
    if (fraudScore >= 80) {
        return 'PENDING';
    }

    if (creditScore < 40) {
        return 'PENDING';
    }

    return 'VERIFIED';
};

/**
 * Calculates the maximum funding eligibility percent based on risk level.
 * 
 * Rules:
 * - LOW: 85%
 * - MEDIUM: 70%
 * - HIGH: 50%
 * 
 * @param {RiskLevel} riskLevel
 * @returns {number} - Percentage (e.g., 85)
 */
export const calculateMaxFundingStats = (riskLevel) => {
    switch (riskLevel) {
        case RiskLevel.LOW:
            return 85;
        case RiskLevel.MEDIUM:
            return 70;
        case RiskLevel.HIGH:
            return 50;
        default:
            return 50; // Fallback
    }
};
