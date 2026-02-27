import { PrismaClient } from '@prisma/client';
import { validateInvoice } from '../validators/invoiceValidator.js';
import { evaluateInvoiceRisk } from '../services/riskEngineService.js';

const prisma = new PrismaClient();

/**
 * Create a new invoice with full risk engine evaluation
 */
export const createInvoice = async (req, res) => {
    try {
        // 1. Validate request body
        const validation = validateInvoice(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Validation Error', details: validation.errors });
        }

        const { amount, dueDate, buyerGSTIN, invoiceNumber } = validation.data;
        const userId = req.user.id;
        const userRole = req.user.role;

        // 2. Ensure user role is MSME
        if (userRole !== 'MSME') {
            return res.status(403).json({ error: 'Access Denied', message: 'Only MSME users can create invoices' });
        }

        // 3. Get user details including KYC for turnover
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { kyc: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.kycStatus !== 'VERIFIED' || !user.kyc) {
            return res.status(403).json({ error: 'Access Denied', message: 'You must complete and verify your KYC before creating invoices' });
        }

        // Data Prep
        const businessAge = user.business_age || 0;
        const annualTurnover = user.kyc.turnover || 0;

        let gstActiveYears = businessAge;
        if (user.kyc.businessStartDate) {
            const startDate = new Date(user.kyc.businessStartDate);
            gstActiveYears = Math.max(0, (new Date() - startDate) / (1000 * 60 * 60 * 24 * 365.25));
        }

        // 4. Create initial PENDING invoice
        const invoice = await prisma.invoice.create({
            data: {
                user_id: userId,
                amount,
                due_date: dueDate,
                buyer_gstin: buyerGSTIN,
                invoice_number: invoiceNumber || null,
                status: 'PENDING',
                gst_verified: true // Assume verified based on KYC
            }
        });

        // 5. Evaluate Full Risk Engine
        const riskResult = await evaluateInvoiceRisk({
            userId,
            invoiceId: invoice.id,
            invoiceAmount: Number(amount),
            annualTurnover: Number(annualTurnover),
            businessAge,
            gstVerified: true,
            gstActiveYears,
            buyerGstin: buyerGSTIN,
            invoiceNumber
        });

        const updatedInvoice = await prisma.invoice.findUnique({
            where: { id: invoice.id }
        });

        // 6. Return Structured API Response
        res.status(201).json({
            message: 'Invoice processed successfully',
            invoice: updatedInvoice,
            ...riskResult
        });

    } catch (error) {
        console.error("Create Invoice Error:", error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

/**
 * Get all invoices for the logged-in user
 */
export const getMyInvoices = async (req, res) => {
    try {
        const userId = req.user.id;

        const invoices = await prisma.invoice.findMany({
            where: { user_id: userId },
            include: {
                risk_analysis: true,
                transactions: true,
                credit_score: true, // Legacy compatibility
                fraud_flags: true   // Legacy compatibility
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(invoices);
    } catch (error) {
        console.error("Get My Invoices Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single invoice by ID
 */
export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                risk_analysis: true,
                transactions: true,
                bids: true,
                credit_score: true, // Legacy
                fraud_flags: true   // Legacy
            }
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.user_id !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access Denied' });
        }

        res.json({
            ...invoice,
            riskAnalysis: invoice.risk_analysis
        });
    } catch (error) {
        console.error("Get Invoice By ID Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get available VERIFIED invoices for Lenders
 */
export const getAvailableInvoices = async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { status: 'VERIFIED' },
            include: {
                user: {
                    include: {
                        kyc: true
                    }
                },
                risk_analysis: true,
                credit_score: true, // Legacy compatibility
                fraud_flags: true   // Legacy compatibility
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(invoices);
    } catch (error) {
        console.error("Get Available Invoices Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};