export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to check role.',
                error: { code: 'UnauthorizedError' }
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.',
                error: { code: 'ForbiddenError' }
            });
        }

        next();
    };
};
