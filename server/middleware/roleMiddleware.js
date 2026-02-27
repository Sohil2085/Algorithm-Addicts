export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user && req.user.role ? req.user.role.toUpperCase() : null;
        const upperAllowedRoles = allowedRoles.map(r => r.toUpperCase());

        if (!userRole || !upperAllowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `You do not have permission. Your role is ${userRole || 'MISSING'}, required: ${upperAllowedRoles.join(', ')}`,
            });
        }
        next();
    };
};
