import express from 'express';
const router = express.Router();
import * as kycController from '../controllers/kyc.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireFeatureEnabled } from '../middleware/feature.middleware.js';

router.use(requireAuth);
router.use(requireFeatureEnabled('KYC_MODULE'));

router.post('/submit', kycController.submitKyc);

export default router;
