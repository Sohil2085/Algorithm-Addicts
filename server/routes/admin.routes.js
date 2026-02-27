import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

router.use(requireAuth);
router.use(requireRole(['ADMIN']));

router.get('/stats', adminController.getDashboardStats);
router.get('/kyc/pending', adminController.getPendingKyc);
router.get('/lender/kyc/pending', adminController.getPendingLenderKyc);
router.post('/kyc/:id/approve', adminController.approveKyc);
router.post('/kyc/:id/reject', adminController.rejectKyc);

router.patch('/lender/:id/approve', adminController.approveLender);
router.patch('/lender/:id/reject', adminController.rejectLender);

router.get('/deals', adminController.getAllDeals);

export default router;