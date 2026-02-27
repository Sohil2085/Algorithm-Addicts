/**
 * Risk Engine Constants
 * This file centralizes all thresholds, limits, and scoring caps
 * used across the financial risk engine to avoid magic numbers.
 */

export const CREDIT_CONSTANTS = {
    MAX_SCORE: 100,

    // Base Points
    BASE_POINTS: 0,

    // Business Age (years) -> Points
    AGE_BANDS: [
        { maxYears: 1, points: 5 },
        { maxYears: 2, points: 10 },
        { maxYears: 3, points: 15 },
        { maxYears: 5, points: 20 },
        { maxYears: Infinity, points: 25 },
    ],

    // Turnover (Rupees) -> Points
    TURNOVER_BANDS: [
        { maxAmount: 10_00_000, points: 5 }, // < 10L
        { maxAmount: 25_00_000, points: 10 }, // < 25L
        { maxAmount: 50_00_000, points: 18 }, // < 50L
        { maxAmount: 100_00_000, points: 24 }, // < 1Cr
        { maxAmount: Infinity, points: 30 }, // > 1Cr
    ],

    // GST Trust Score
    GST_SCORE: {
        UNVERIFIED: 0,
        VERIFIED_ACTIVE_LT_1: 10,  // Verified but < 1 year active
        VERIFIED_ACTIVE_GTE_1: 15, // Verified and >= 1 year active
    },

    // Invoice Exposure Score (Invoice Amount / Annual Turnover)
    EXPOSURE_BANDS: [
        { maxRatio: 0.05, points: 30 }, // < 5%
        { maxRatio: 0.10, points: 25 }, // 5-10%
        { maxRatio: 0.20, points: 18 }, // 10-20%
        { maxRatio: 0.30, points: 10 }, // 20-30%
        { maxRatio: Infinity, points: 5 }, // > 30%
    ]
};

export const FRAUD_CONSTANTS = {
    MAX_SCORE: 100,

    // Invoice-to-Turnover Fraud Risk
    RATIO_RISK_BANDS: [
        { maxRatio: 0.05, points: 0 }, // < 5%
        { maxRatio: 0.10, points: 5 }, // 5-10%
        { maxRatio: 0.20, points: 10 }, // 10-20%
        { maxRatio: 0.30, points: 20 }, // 20-30%
        { maxRatio: Infinity, points: 30 }, // > 30%
    ],

    // Spike Detection (Invoice vs Average of last 6)
    SPIKE_MULTIPLIERS: [
        { multiplier: 2.0, points: 20 },
        { multiplier: 1.5, points: 10 },
        // Below 1.5 adds 0
    ],

    // Round Amount Pattern
    ROUND_AMOUNT: {
        DIVISOR: 10000, // e.g. amount % 10000 == 0
        SINGLE_INSTANCE_POINTS: 5,
        MULTIPLE_INSTANCE_POINTS: 15, // If last 3 invoices have pattern
        HISTORY_CHECK_COUNT: 3
    },

    // Age vs Invoice Mismatch
    AGE_MISMATCH: {
        SAFE_LIMIT_PER_YEAR: 10_00_000, // Safe limit per business age year
        POINTS: 20
    },

    // Duplicate Check
    DUPLICATE: {
        TIME_WINDOW_HOURS: 24, // Short time window for duplicate check (e.g. last 24h)
        AMOUNT_TOLERANCE_PERCENT: 0.01, // 1% difference in amount is considered similar
        POINTS: 15
    }
};

export const RISK_BANDS = {
    CREDIT: [
        { min: 80, max: 100, label: 'Low Risk' },
        { min: 60, max: 79, label: 'Moderate Risk' },
        { min: 40, max: 59, label: 'High Risk' },
        { min: 0, max: 39, label: 'Very High Risk' }
    ],
    FRAUD: [
        { min: 0, max: 20, label: 'Safe' },
        { min: 21, max: 40, label: 'Low Suspicion' },
        { min: 41, max: 60, label: 'Medium Risk' },
        { min: 61, max: 80, label: 'High Risk' },
        { min: 81, max: 100, label: 'Critical Risk' }
    ]
};
