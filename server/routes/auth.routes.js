import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

router.post('/signup', authController.signup);
router.post('/register', authController.signup); // Added for frontend compatibility
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);

export default router;
