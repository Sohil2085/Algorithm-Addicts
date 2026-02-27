import * as lenderService from '../services/lender.service.js';
import { submitLenderKycSchema } from '../validators/lender.validator.js';

export const submitKyc = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const validationResult = submitLenderKycSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationResult.error.errors
            });
        }

        const result = await lenderService.submitKyc(userId, validationResult.data);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Lender KYC submitted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await lenderService.getProfile(userId);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};
