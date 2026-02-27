import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAgreement, signAgreement } from '../controllers/agreementController.js';

const router = express.Router();

// Both MSME and Lender can view and sign their deal agreement
router.get('/:dealId', protect, getAgreement);
router.post('/:dealId/sign', protect, signAgreement);

export default router;
