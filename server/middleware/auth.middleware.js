import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: No token provided.',
                error: { code: 'UnauthorizedError' }
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_fallback');

        // Attach sanitized user info
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            kycStatus: decoded.kycStatus
        };

        next();
    } catch (error) {
        next(error);
    }
};
