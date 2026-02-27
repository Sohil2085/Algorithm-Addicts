import * as kycService from '../services/kyc.service.js';

export const submitKyc = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const kycData = req.body;

        const requiredFields = ['gstNumber', 'legalName', 'businessName', 'businessStartDate', 'businessAddress', 'turnover'];
        for (const field of requiredFields) {
            if (!kycData[field]) {
                const error = new Error(`Missing required field: ${field}`);
                error.name = 'ValidationError';
                throw error;
            }
        }

        const result = await kycService.submitKyc(userId, kycData);

        res.status(200).json({
            success: true,
            data: result,
            message: 'KYC submitted successfully'
        });
    } catch (error) {
        next(error);
    }
};
