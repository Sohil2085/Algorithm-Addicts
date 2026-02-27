import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { refreshCache } from '../middleware/feature.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all feature flags (accessible by authenticated users, for context)
router.get('/', requireAuth, async (req, res) => {
    try {
        // Always refresh cache to automatically seed any new codebase defaultFlags
        await refreshCache();
        let features = await prisma.featureFlag.findMany();
        res.json({ success: true, features });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch features' });
    }
});

// Toggle a feature flag (Admin/Controller only)
router.patch('/admin/:featureKey', requireAuth, requireRole(['CONTROLLER']), async (req, res) => {
    try {
        const { featureKey } = req.params;
        const { isEnabled } = req.body;

        const updatedFeature = await prisma.featureFlag.upsert({
            where: { featureKey },
            update: { isEnabled },
            create: { featureKey, isEnabled }
        });

        res.json({ success: true, feature: updatedFeature });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update feature flag' });
    }
});

export default router;
