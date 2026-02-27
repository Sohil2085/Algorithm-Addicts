import express from 'express';
const router = express.Router();
import * as lenderController from '../controllers/lender.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { requireFeatureEnabled } from '../middleware/feature.middleware.js';

router.use(requireAuth);
router.use(requireRole(['LENDER']));
router.use(requireFeatureEnabled('LENDER_KYC'));

router.post('/kyc/submit', lenderController.submitKyc);
router.get('/profile', lenderController.getProfile);

export default router;
