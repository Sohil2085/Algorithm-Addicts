export const requireVerifiedLender = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required to check verification status.',
            error: { code: 'UnauthorizedError' }
        });
    }

    if (req.user.role === 'LENDER' && req.user.kycStatus !== 'VERIFIED') {
        return res.status(403).json({
            success: false,
            message: 'Complete Lender Verification to access marketplace.',
            error: { code: 'ForbiddenError' }
        });
    }

    next();
};
