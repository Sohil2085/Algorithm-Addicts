import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// In-memory cache for feature flags
let featureCache = new Map();
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export const refreshCache = async () => {
    try {
        const flags = await prisma.featureFlag.findMany();
        const newCache = new Map();

        // Default flags to insert if they don't exist
        const defaultFlags = [
            'KYC_MODULE',
            'LENDER_KYC',
            'INVOICE_UPLOAD',
            'LENDER_MARKETPLACE',
            'FUNDING_OFFER',
            'AGREEMENT_GENERATION',
            'PAYMENT_SIMULATION',
            'NOTIFICATION_SYSTEM'
        ];

        const existingKeys = new Set(flags.map(f => f.featureKey));

        // Seed missing defaults gracefully
        for (const key of defaultFlags) {
            if (!existingKeys.has(key)) {
                await prisma.featureFlag.create({
                    data: { featureKey: key, isEnabled: true }
                });
                newCache.set(key, true);
            }
        }

        flags.forEach(f => newCache.set(f.featureKey, f.isEnabled));
        featureCache = newCache;
        lastCacheUpdate = Date.now();
    } catch (error) {
        console.error('Error refreshing feature cache:', error);
    }
};

export const requireFeatureEnabled = (featureKey) => {
    return async (req, res, next) => {
        // Refresh cache if expired or empty
        if (Date.now() - lastCacheUpdate > CACHE_TTL || featureCache.size === 0) {
            await refreshCache();
        }

        const isEnabled = featureCache.get(featureKey);

        // If not explicitly disabled, default to enabled
        if (isEnabled === false) {
            return res.status(403).json({
                success: false,
                message: `The feature '${featureKey}' is currently disabled by administrator.`
            });
        }

        next();
    };
};
