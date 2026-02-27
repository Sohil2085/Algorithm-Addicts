import { CREDIT_CONSTANTS } from './riskConstants.js';

/**
 * Calculates Base Credit Score (0-100) based on positive trust indicators.
 * 
 * @param {Object} params
 * @param {number} params.businessAge - Business age in years
 * @param {number} params.annualTurnover - Annual turnover in INR
 * @param {boolean} params.gstVerified - Whether GST is verified
 * @param {number} params.gstActiveYears - Number of years GST has been active (can default to businessAge if unknown)
 * @param {number} params.invoiceAmount - Current invoice amount in INR
 * 
 * @returns {Object} { score: number, breakdown: Object }
 */
export const calculateCreditScore = ({
    businessAge,
    annualTurnover,
    gstVerified,
    gstActiveYears,
    invoiceAmount
}) => {
    let totalScore = CREDIT_CONSTANTS.BASE_POINTS;
    const breakdown = {
        ageScore: { score: 0, reason: '' },
        turnoverScore: { score: 0, reason: '' },
        gstScore: { score: 0, reason: '' },
        exposureScore: { score: 0, reason: '' },
    };

    // 1) BUSINESS AGE SCORE
    const ageBand = CREDIT_CONSTANTS.AGE_BANDS.find(b => businessAge < b.maxYears) || CREDIT_CONSTANTS.AGE_BANDS[CREDIT_CONSTANTS.AGE_BANDS.length - 1];
    breakdown.ageScore.score = ageBand.points;
    breakdown.ageScore.reason = `Business age is ${businessAge} years (< ${ageBand.maxYears === Infinity ? 'Infinity' : ageBand.maxYears} years expected stability).`;
    totalScore += ageBand.points;

    // 2) TURNOVER SCORE
    const turnoverBand = CREDIT_CONSTANTS.TURNOVER_BANDS.find(b => annualTurnover < b.maxAmount) || CREDIT_CONSTANTS.TURNOVER_BANDS[CREDIT_CONSTANTS.TURNOVER_BANDS.length - 1];
    breakdown.turnoverScore.score = turnoverBand.points;
    breakdown.turnoverScore.reason = `Annual turnover is ₹${annualTurnover.toLocaleString()} (< ₹${turnoverBand.maxAmount === Infinity ? 'Infinity' : turnoverBand.maxAmount.toLocaleString()}).`;
    totalScore += turnoverBand.points;

    // 3) GST TRUST SCORE
    if (!gstVerified) {
        breakdown.gstScore.score = CREDIT_CONSTANTS.GST_SCORE.UNVERIFIED;
        breakdown.gstScore.reason = `GST is not verified.`;
    } else if (gstActiveYears < 1) {
        breakdown.gstScore.score = CREDIT_CONSTANTS.GST_SCORE.VERIFIED_ACTIVE_LT_1;
        breakdown.gstScore.reason = `GST is verified but active for less than 1 year (${gstActiveYears} years).`;
        totalScore += CREDIT_CONSTANTS.GST_SCORE.VERIFIED_ACTIVE_LT_1;
    } else {
        breakdown.gstScore.score = CREDIT_CONSTANTS.GST_SCORE.VERIFIED_ACTIVE_GTE_1;
        breakdown.gstScore.reason = `GST is verified and active for >= 1 year (${gstActiveYears} years).`;
        totalScore += CREDIT_CONSTANTS.GST_SCORE.VERIFIED_ACTIVE_GTE_1;
    }

    // 4) INVOICE EXPOSURE SCORE
    const invoiceRatio = annualTurnover > 0 ? (invoiceAmount / annualTurnover) : Infinity; // Handle divide by zero

    // Find correctly exposed band
    const exposureBand = CREDIT_CONSTANTS.EXPOSURE_BANDS.find(b => invoiceRatio < b.maxRatio) || CREDIT_CONSTANTS.EXPOSURE_BANDS[CREDIT_CONSTANTS.EXPOSURE_BANDS.length - 1];
    breakdown.exposureScore.score = exposureBand.points;
    breakdown.exposureScore.reason = `Invoice ratio is ${(invoiceRatio * 100).toFixed(2)}% of turnover (< ${(exposureBand.maxRatio === Infinity ? 'Infinity' : exposureBand.maxRatio * 100)}%).`;
    totalScore += exposureBand.points;

    // Finally Cap Score
    const finalScore = Math.min(Math.max(0, totalScore), CREDIT_CONSTANTS.MAX_SCORE);

    return {
        score: finalScore,
        breakdown
    };
};
""