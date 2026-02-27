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

export const createOffer = async (offerData) => {
    try {
        const response = await api.post('/offers/create', offerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const acceptOffer = async (id) => {
    try {
        const response = await api.patch(`/offers/${id}/accept`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getMyOffers = async () => {
    try {
        const response = await api.get('/offers/my-offers');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
