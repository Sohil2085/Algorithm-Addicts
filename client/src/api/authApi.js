import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const register = async (payload) => {
    try {
        const response = await api.post('/auth/register', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Registration failed';
    }
};

export const login = async (payload) => {
    try {
        const response = await api.post('/auth/login', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Login failed';
    }
};

export default api;