import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createOffer, acceptOffer, getMyOffers } from '../controllers/offerController.js';

const router = express.Router();

router.get('/my-offers', protect, authorize('MSME'), getMyOffers);
router.post('/create', protect, authorize('LENDER'), createOffer);
router.patch('/:id/accept', protect, authorize('MSME'), acceptOffer);

export default router;
