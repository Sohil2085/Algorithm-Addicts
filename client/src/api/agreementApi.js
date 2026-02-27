import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getAgreement = async (dealId) => {
    try {
        const response = await api.get(`/agreement/${dealId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const signAgreement = async (dealId) => {
    try {
        const response = await api.post(`/agreement/${dealId}/sign`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
