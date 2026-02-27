import { FRAUD_CONSTANTS } from './riskConstants.js';

/**
 * Calculates Fraud Risk Score (0-100) and Probability (0-1).
 * 
 * @param {Object} params
 * @param {number} params.invoiceAmount - Current invoice amount in INR
 * @param {number} params.annualTurnover - Annual turnover in INR
 * @param {number} params.businessAge - Business age in years
 * @param {number[]} params.last6Invoices - Array of last 6 invoice amounts for spike detection
 * @param {Object[]} params.invoiceHistory - Array of past invoices for round pattern history
 * @param {boolean} params.hasDuplicate - Boolean indicating if a duplicate invoice was found within timeframe
 * 
 * @returns {Object} { score: number, probability: number, breakdown: Object }
 */
export const calculateFraudScore = ({
    invoiceAmount,
    annualTurnover,
    businessAge,
    last6Invoices = [],
    invoiceHistory = [],
    hasDuplicate = false
}) => {
    let totalScore = 0;
    const breakdown = {
        ratioRisk: { score: 0, reason: '' },
        spikeRisk: { score: 0, reason: '' },
        roundRisk: { score: 0, reason: '' },
        ageMismatchRisk: { score: 0, reason: '' },
        duplicateRisk: { score: 0, reason: '' },
    };

    // 1) INVOICE-TO-TURNOVER FRAUD RISK
    const invoiceRatio = annualTurnover > 0 ? (invoiceAmount / annualTurnover) : Infinity;
    const ratioRiskBand = FRAUD_CONSTANTS.RATIO_RISK_BANDS.find(b => invoiceRatio < b.maxRatio) || FRAUD_CONSTANTS.RATIO_RISK_BANDS[FRAUD_CONSTANTS.RATIO_RISK_BANDS.length - 1];

    breakdown.ratioRisk.score = ratioRiskBand.points;
    breakdown.ratioRisk.reason = `Invoice is ${(invoiceRatio * 100).toFixed(2)}% of turnover (< ${(ratioRiskBand.maxRatio === Infinity ? 'Infinity' : ratioRiskBand.maxRatio * 100)}%).`;
    totalScore += ratioRiskBand.points;


    // 2) SPIKE DETECTION
    if (last6Invoices.length > 0) {
        const avgLast6 = last6Invoices.reduce((a, b) => a + b, 0) / last6Invoices.length;
        if (avgLast6 > 0) {
            const spikeMultiplier = invoiceAmount / avgLast6;

            // Expected bands: > 2.0x, > 1.5x
            const spikeBand = FRAUD_CONSTANTS.SPIKE_MULTIPLIERS.find(b => spikeMultiplier > b.multiplier);
            if (spikeBand) {
                breakdown.spikeRisk.score = spikeBand.points;
                breakdown.spikeRisk.reason = `Invoice amount is ${spikeMultiplier.toFixed(2)}x the average of last 6 invoices (> ${spikeBand.multiplier}x).`;
                totalScore += spikeBand.points;
            }
        }
    }


    // 3) ROUND AMOUNT PATTERN
    let hasRoundRisk = false;
    if (invoiceAmount % FRAUD_CONSTANTS.ROUND_AMOUNT.DIVISOR === 0) {
        // Check if last 3 invoices also have round numbers
        const last3Invoices = invoiceHistory.slice(0, FRAUD_CONSTANTS.ROUND_AMOUNT.HISTORY_CHECK_COUNT);
        const historyRoundCount = last3Invoices.filter(inv => inv.amount % FRAUD_CONSTANTS.ROUND_AMOUNT.DIVISOR === 0).length;

        if (historyRoundCount === FRAUD_CONSTANTS.ROUND_AMOUNT.HISTORY_CHECK_COUNT && last3Invoices.length === FRAUD_CONSTANTS.ROUND_AMOUNT.HISTORY_CHECK_COUNT) {
            breakdown.roundRisk.score = FRAUD_CONSTANTS.ROUND_AMOUNT.MULTIPLE_INSTANCE_POINTS;
            breakdown.roundRisk.reason = `Current and previous 3 invoices all have round artificial figures.`;
            totalScore += FRAUD_CONSTANTS.ROUND_AMOUNT.MULTIPLE_INSTANCE_POINTS;
            hasRoundRisk = true;
        } else {
            breakdown.roundRisk.score = FRAUD_CONSTANTS.ROUND_AMOUNT.SINGLE_INSTANCE_POINTS;
            breakdown.roundRisk.reason = `Invoice amount is a round artificial figure (multiple of ${FRAUD_CONSTANTS.ROUND_AMOUNT.DIVISOR}).`;
            totalScore += FRAUD_CONSTANTS.ROUND_AMOUNT.SINGLE_INSTANCE_POINTS;
            hasRoundRisk = true;
        }
    }

    if (!hasRoundRisk) {
        breakdown.roundRisk.score = 0;
        breakdown.roundRisk.reason = `No suspicious round amount patterns detected.`;
    }

    // 4) AGE VS INVOICE MISMATCH
    const expectedSafeLimit = (businessAge || 0) * FRAUD_CONSTANTS.AGE_MISMATCH.SAFE_LIMIT_PER_YEAR;
    if (invoiceAmount > expectedSafeLimit) {
        breakdown.ageMismatchRisk.score = FRAUD_CONSTANTS.AGE_MISMATCH.POINTS;
        breakdown.ageMismatchRisk.reason = `Invoice (₹${invoiceAmount.toLocaleString()}) exceeds expected safe limit (₹${expectedSafeLimit.toLocaleString()}) for business age (${businessAge} yrs).`;
        totalScore += FRAUD_CONSTANTS.AGE_MISMATCH.POINTS;
    }


    // 5) DUPLICATE CHECK
    if (hasDuplicate) {
        breakdown.duplicateRisk.score = FRAUD_CONSTANTS.DUPLICATE.POINTS;
        breakdown.duplicateRisk.reason = `Similar invoice to same buyer found within ${FRAUD_CONSTANTS.DUPLICATE.TIME_WINDOW_HOURS} hours.`;
        totalScore += FRAUD_CONSTANTS.DUPLICATE.POINTS;
    }


    // Finally Cap Score
    const finalScore = Math.min(Math.max(0, totalScore), FRAUD_CONSTANTS.MAX_SCORE);
    const fraudProbability = finalScore / 100.0;

    return {
        score: finalScore,
        probability: fraudProbability,
        breakdown
    };
};
