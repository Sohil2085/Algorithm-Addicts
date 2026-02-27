import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getMyWallet = async () => {
    try {
        const response = await api.get('/wallet/my-wallet');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const topUpWallet = async (amount) => {
    try {
        const response = await api.post('/wallet/topup', { amount });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
