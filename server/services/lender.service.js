import prisma from '../config/prisma.js';

export const submitKyc = async (userId, kycData) => {
    const existingProfile = await prisma.lenderProfile.findUnique({
        where: { userId }
    });

    if (existingProfile && (existingProfile.verificationStatus === 'IN_REVIEW' || existingProfile.verificationStatus === 'VERIFIED')) {
        const error = new Error('KYC already submitted or verified');
        error.name = 'ValidationError';
        throw error;
    }

    const {
        lenderType,
        organizationName,
        registrationNumber,
        rbiLicenseNumber,
        gstNumber,
        panNumber,
        contactPersonName,
        contactPhone,
        officialEmail,
        capitalRange,
        riskPreference,
        bankAccountNumber,
        ifscCode
    } = kycData;

    const result = await prisma.$transaction(async (tx) => {
        let profileRecord;
        const dataPayload = {
            lenderType,
            organizationName,
            registrationNumber,
            rbiLicenseNumber,
            gstNumber,
            panNumber,
            contactPersonName,
            contactPhone,
            officialEmail,
            capitalRange,
            riskPreference,
            bankAccountNumber,
            ifscCode,
            verificationStatus: 'IN_REVIEW'
        };

        if (existingProfile) {
            profileRecord = await tx.lenderProfile.update({
                where: { userId },
                data: dataPayload
            });
        } else {
            profileRecord = await tx.lenderProfile.create({
                data: {
                    userId,
                    ...dataPayload
                }
            });
        }

        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                kycStatus: 'IN_PROGRESS'
            }
        });

        return profileRecord;
    });

    return result;
};

export const getProfile = async (userId) => {
    const profile = await prisma.lenderProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: { name: true, email: true }
            }
        }
    });
    return profile;
};
