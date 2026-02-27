export const requireVerifiedKYC = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required to check KYC status.',
            error: { code: 'UnauthorizedError' }
        });
    }

    if (req.user.kycStatus !== 'VERIFIED') {
        return res.status(403).json({
            success: false,
            message: 'Complete KYC to access this feature.',
            error: { code: 'ForbiddenError' }
        });
    }

    next();
};
