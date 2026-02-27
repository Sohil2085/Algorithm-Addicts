import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyWallet, topUpWallet } from '../controllers/walletController.js';

const router = express.Router();

router.get('/my-wallet', protect, getMyWallet);
router.get('/me', protect, getMyWallet); // Alias for MSME/Lender frontend usage
router.post('/topup', protect, topUpWallet);

export default router;
