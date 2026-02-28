import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { fundDeal, repayDeal, getMyDeals } from '../controllers/dealController.js';

import { requireVerifiedLender } from '../middleware/verification.middleware.js';

const router = express.Router();

router.get('/my-deals', protect, getMyDeals);
router.post('/:id/fund', protect, authorize('LENDER'), requireVerifiedLender, fundDeal);
router.post('/:id/repay', protect, repayDeal);

export default router;
