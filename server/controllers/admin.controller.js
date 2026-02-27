import prisma from '../config/prisma.js';

export const getPendingKyc = async (req, res, next) => {
    try {
        const pendingKycList = await prisma.kYC.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, riskScore: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Pending KYC requests fetched successfully',
            data: pendingKycList
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingLenderKyc = async (req, res, next) => {
    try {
        const pendingLenders = await prisma.lenderProfile.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Pending Lender KYC requests fetched successfully',
            data: pendingLenders
        });
    } catch (error) {
        next(error);
    }
};

export const approveKyc = async (req, res, next) => {
    try {
        const kycId = req.params.id;

        const result = await prisma.$transaction(async (tx) => {
            const kyc = await tx.kYC.update({
                where: { id: kycId },
                data: {
                    status: 'VERIFIED',
                    reviewedAt: new Date()
                }
            });

            await tx.user.update({
                where: { id: kyc.userId },
                data: { kycStatus: 'VERIFIED' }
            });

            return kyc;
        });

        res.status(200).json({
            success: true,
            message: 'KYC Approved Successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const rejectKyc = async (req, res, next) => {
    try {
        const kycId = req.params.id;
        const { adminRemark } = req.body;

        if (!adminRemark) {
            const error = new Error('Admin remark is required for rejection');
            error.name = 'ValidationError';
            throw error;
        }

        const result = await prisma.$transaction(async (tx) => {
            const kyc = await tx.kYC.update({
                where: { id: kycId },
                data: {
                    status: 'REJECTED',
                    adminRemark,
                    reviewedAt: new Date()
                }
            });

            await tx.user.update({
                where: { id: kyc.userId },
                data: { kycStatus: 'REJECTED' }
            });

            return kyc;
        });

        res.status(200).json({
            success: true,
            message: 'KYC Rejected Successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getDashboardStats = async (req, res, next) => {
    try {
        const totalMsmes = await prisma.user.count({ where: { role: 'MSME' } });
        const totalLenders = await prisma.user.count({ where: { role: 'LENDER' } });
        const totalInvoices = await prisma.invoice.count();

        const fundingAgg = await prisma.transaction.aggregate({
            _sum: { funded_amount: true },
            where: { status: 'COMPLETED' }
        });

        const totalFunding = fundingAgg._sum.funded_amount || 0;

        res.status(200).json({
            success: true,
            data: {
                totalMsmes,
                totalLenders,
                totalInvoices,
                totalFunding
            }
        });
    } catch (error) {
        next(error);
    }
};

export const approveLender = async (req, res, next) => {
    try {
        const id = req.params.id;

        const result = await prisma.$transaction(async (tx) => {
            const profile = await tx.lenderProfile.update({
                where: { id },
                data: {
                    verificationStatus: 'VERIFIED'
                }
            });

            await tx.user.update({
                where: { id: profile.userId },
                data: { kycStatus: 'VERIFIED' }
            });

            return profile;
        });

        res.status(200).json({
            success: true,
            message: 'Lender KYC Approved Successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const rejectLender = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { adminRemark } = req.body;

        if (!adminRemark) {
            const error = new Error('Admin remark is required for rejection');
            error.name = 'ValidationError';
            throw error;
        }

        const result = await prisma.$transaction(async (tx) => {
            const profile = await tx.lenderProfile.update({
                where: { id },
                data: {
                    verificationStatus: 'REJECTED',
                    adminRemark
                }
            });

            await tx.user.update({
                where: { id: profile.userId },
                data: { kycStatus: 'REJECTED' }
            });

            return profile;
        });

        res.status(200).json({
            success: true,
            message: 'Lender KYC Rejected Successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getAllDeals = async (req, res, next) => {
    try {
        const deals = await prisma.deal.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                invoice: { select: { invoice_number: true, due_date: true, amount: true } },
                lender: { select: { name: true, email: true } },
                msme: { select: { name: true, email: true } }
            }
        });

        res.status(200).json({
            success: true,
            data: deals
        });
    } catch (error) {
        next(error);
    }
};
