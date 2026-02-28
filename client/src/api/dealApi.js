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

export const signAgreement = async (id) => {
    try {
        const response = await api.post(`/deal/${id}/sign`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const downloadAgreement = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/deal/${id}/agreement`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to download agreement');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AGR-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};
