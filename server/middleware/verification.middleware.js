import prisma from '../config/prisma.js';

export const requireVerifiedLender = async (req, res, next) => {
    try {
        if (req.user.role === 'LENDER') {
            const profile = await prisma.lenderProfile.findUnique({
                where: { userId: req.user.id },
                select: { isVerified: true }
            });

            if (!profile || profile.isVerified !== true) {
                return res.status(403).json({
                    success: false,
                    message: "Lender verification required before funding."
                });
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};
