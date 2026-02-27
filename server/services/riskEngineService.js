import { PrismaClient } from '@prisma/client';
import { calculateCreditScore } from './creditScoreService.js';
import { calculateFraudScore } from './fraudDetectionService.js';
import { RISK_BANDS } from './riskConstants.js';

const prisma = new PrismaClient();

const getRiskBand = (score, bands) => {
    const band = bands.find(b => score >= b.min && score <= b.max);
    return band ? band.label : 'Unknown';
};

/**
 * Orchestrates the full risk engine evaluation.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.invoiceId
 * @param {number} params.invoiceAmount
 * @param {number} params.annualTurnover
 * @param {number} params.businessAge
 * @param {boolean} params.gstVerified
 * @param {number} params.gstActiveYears
 * @param {string} params.buyerGstin
 * @param {string} params.invoiceNumber
 * 
 * @returns {Promise<Object>} The structured risk analysis response
 */
export const evaluateInvoiceRisk = async ({
    userId,
    invoiceId,
    invoiceAmount,
    annualTurnover,
    businessAge,
    gstVerified,
    gstActiveYears,
    buyerGstin,
    invoiceNumber
}) => {
    try {
        // --- PREPARE FRAUD INPUTS ---

        // Fetch last 6 invoices average
        const last6InvoicesData = await prisma.invoice.findMany({
            where: { user_id: userId, id: { not: invoiceId } },
            orderBy: { created_at: 'desc' },
            take: 6,
            select: { amount: true }
        });
        const last6Invoices = last6InvoicesData.map(i => Number(i.amount));

        // Fetch invoice history for round amount checks
        const invoiceHistoryData = await prisma.invoice.findMany({
            where: { user_id: userId, id: { not: invoiceId } },
            orderBy: { created_at: 'desc' },
            take: 3,
            select: { amount: true }
        });
        const invoiceHistory = invoiceHistoryData.map(i => ({ amount: Number(i.amount) }));

        // Check for duplicates (same buyer, similar amount, last 24h)
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const duplicateReferenceDate = new Date(Date.now() - ONE_DAY_MS);

        const duplicateCheck = await prisma.invoice.findFirst({
            where: {
                user_id: userId,
                id: { not: invoiceId },
                buyer_gstin: buyerGstin,
                invoice_number: invoiceNumber,
                created_at: { gte: duplicateReferenceDate }
            }
        });
        const hasDuplicate = !!duplicateCheck;

        // --- 1. COMPUTE CREDIT SCORE ---
        const creditResult = calculateCreditScore({
            businessAge,
            annualTurnover,
            gstVerified,
            gstActiveYears,
            invoiceAmount
        });

        // --- 2. COMPUTE FRAUD SCORE ---
        const fraudResult = calculateFraudScore({
            invoiceAmount,
            annualTurnover,
            businessAge,
            last6Invoices,
            invoiceHistory,
            hasDuplicate
        });

        // --- 3. FINAL SCORE CALCULATION ---
        // DO NOT subtract. Use probability adjustment.
        // finalScore = creditScore * (1 - fraudProbability)
        const finalScore = Math.round(creditResult.score * (1 - fraudResult.probability));

        // --- 4. RISK BANDS ---
        const creditRiskBand = getRiskBand(finalScore, RISK_BANDS.CREDIT); // Or creditResult.score? The prompt says "Credit Risk Bands" vs "Fraud Risk Bands". Often final score dictates credit band. Let's use final score for the overall credit band, or base credit. "Risk-Adjusted Final Score" is the ultimate measure of creditworthiness. I'll use finalScore. Wait, the prompt says "Credit Risk Bands ... Fraud Risk Bands". I'll use `finalScore` for Credit Band, as it's the Adjusted Credit Score. Or `creditResult.score`? Let's use `finalScore`.
        const fraudRiskBand = getRiskBand(fraudResult.score, RISK_BANDS.FRAUD);

        // --- 5. DATABASE STORAGE ---
        const breakdownJSON = {
            credit: creditResult.breakdown,
            fraud: fraudResult.breakdown
        };

        const riskAnalysisRecord = await prisma.invoiceRiskAnalysis.create({
            data: {
                invoiceId,
                creditScore: creditResult.score,
                fraudScore: fraudResult.score,
                fraudProbability: fraudResult.probability,
                finalScore,
                creditRiskBand,
                fraudRiskBand,
                breakdownJSON,
            }
        });

        // Also update the invoice status (e.g., if fraud is too high or credit is too low -> PENDING) 
        // This replaces determineInvoiceStatus from old code.
        let status = 'VERIFIED';
        if (fraudResult.score >= 80 || finalScore < 40) {
            status = 'PENDING';
        }

        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status }
        });

        // --- 6. API RESPONSE FORMAT ---
        return {
            creditScore: creditResult.score,
            fraudScore: fraudResult.score,
            fraudProbability: fraudResult.probability,
            finalScore,
            creditRiskBand,
            fraudRiskBand,
            breakdown: breakdownJSON
        };

    } catch (error) {
        console.error("Risk Engine Error:", error);
        throw new Error(`Failed to evaluate invoice risk: ${error.message}`);
    }
};
