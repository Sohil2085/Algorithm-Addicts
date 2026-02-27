import api from './authApi';

export const submitKyc = async (kycData) => {
    try {
        const response = await api.post('/kyc/submit', kycData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to submit KYC details';
    }
};
