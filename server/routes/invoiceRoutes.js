
import express from 'express';
import { createInvoice, getMyInvoices, getInvoiceById, getAvailableInvoices } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import { requireFeatureEnabled } from '../middleware/feature.middleware.js';
import { requireVerifiedLender } from '../middleware/lender.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes in this router
// All invoice operations require a logged-in user
router.use(protect);
router.use(requireFeatureEnabled('INVOICE_UPLOAD'));

// Create a new invoice (MSME only)
router.post(
    '/create',
    checkRole(['MSME']),
    createInvoice
);

// Get invoices for the logged-in user (MSME only)
// Lenders/Admins might need different endpoints or role checks, 
// strictly following request for "MSME only" for this route.
router.get(
    '/my',
    checkRole(['MSME']),
    getMyInvoices
);

// Get available invoices for lenders (LENDER role + verified lender check)
// This needs to be checked before /:id so that 'available' is not treated as an ID
router.get(
    '/available',
    checkRole(['LENDER', 'ADMIN']),
    requireVerifiedLender,
    getAvailableInvoices
);

// Get specific invoice by ID (Authenticated user)
// Controller handles ownership checks, but lenders must be verified to view
router.get(
    '/:id',
    requireVerifiedLender,
    getInvoiceById
);

export default router;
