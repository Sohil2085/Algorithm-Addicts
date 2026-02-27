import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { validateGST } from '../utils/gstValidator.js';
import { calculateRiskScore } from '../utils/riskEngine.js';

export const submitKyc = async (userId, kycData) => {
    const existingKyc = await prisma.kYC.findUnique({
        where: { userId }
    });

    if (existingKyc && (existingKyc.status === 'IN_PROGRESS' || existingKyc.status === 'VERIFIED')) {
        const error = new Error('KYC already submitted or verified');
        error.name = 'ValidationError';
        throw error;
    }

    const gstValidation = validateGST(kycData.gstNumber);
    if (!gstValidation.isValid) {
        const error = new Error('Invalid GST Number format');
        error.name = 'ValidationError';
        throw error;
    }

    const { stateCode, panNumber } = gstValidation;
    const businessStartDate = new Date(kycData.businessStartDate);
    const legalNameMismatch = false;

    const { score: riskScore, level: riskLevel } = calculateRiskScore({
        businessStartDate,
        turnover: parseFloat(kycData.turnover),
        stateCode,
        legalNameMismatch
    });

    const currentDate = new Date();
    const startDate = new Date(businessStartDate);
    let businessAgeYears = currentDate.getFullYear() - startDate.getFullYear();
    const m = currentDate.getMonth() - startDate.getMonth();
    if (m < 0 || (m === 0 && currentDate.getDate() < startDate.getDate())) {
        businessAgeYears--;
    }
    const safeBusinessAge = Math.max(0, businessAgeYears);

    const result = await prisma.$transaction(async (tx) => {
        let kycRecord;
        if (existingKyc) {
            kycRecord = await tx.kYC.update({
                where: { userId },
                data: {
                    gstNumber: kycData.gstNumber,
                    legalName: kycData.legalName,
                    businessName: kycData.businessName,
                    businessStartDate,
                    businessAddress: kycData.businessAddress,
                    turnover: parseFloat(kycData.turnover),
                    stateCode,
                    panNumber,
                    gstCertificateUrl: kycData.gstCertificateUrl || null,
                    status: 'IN_PROGRESS',
                }
            });
        } else {
            kycRecord = await tx.kYC.create({
                data: {
                    userId,
                    gstNumber: kycData.gstNumber,
                    legalName: kycData.legalName,
                    businessName: kycData.businessName,
                    businessStartDate,
                    businessAddress: kycData.businessAddress,
                    turnover: parseFloat(kycData.turnover),
                    stateCode,
                    panNumber,
                    gstCertificateUrl: kycData.gstCertificateUrl || null,
                    status: 'IN_PROGRESS',
                }
            });
        }

        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                kycStatus: 'IN_PROGRESS',
                riskScore,
                business_age: safeBusinessAge,
                gstin: kycData.gstNumber,
            }
        });

        return { kycStatus: updatedUser.kycStatus, riskScore, riskLevel };
    });

    return result;
};
