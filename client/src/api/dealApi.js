import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

export const fundDeal = async (id) => {
    try {
        const response = await api.post(`/deal/${id}/fund`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const repayDeal = async (id) => {
    try {
        const response = await api.post(`/deal/${id}/repay`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getMyDeals = async () => {
    try {
        const response = await api.get('/deal/my-deals');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
