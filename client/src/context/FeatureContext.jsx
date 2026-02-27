import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FeatureContext = createContext(null);

export const FeatureProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [features, setFeatures] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchFeatures = async () => {
        try {
            // Using standard axios here since api.js might not be exporting perfectly for this independent context
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${API_BASE_URL}/features`, {
                headers: {
                    Authorization: `Bearer ${token || localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                const featureMap = {};
                response.data.features.forEach(f => {
                    featureMap[f.featureKey] = f.isEnabled;
                });
                setFeatures(featureMap);
            }
        } catch (error) {
            console.error('Failed to fetch feature flags:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchFeatures();
        } else {
            setFeatures({});
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    return (
        <FeatureContext.Provider value={{ features, loading, refreshFeatures: fetchFeatures }}>
            {children}
        </FeatureContext.Provider>
    );
};

export const useFeatures = () => useContext(FeatureContext);

export const FeatureGuard = ({ featureKey, children, fallback = null }) => {
    const { features, loading } = useFeatures();

    if (loading) return null; // Or a small spinner

    if (features[featureKey] === false) {
        return fallback;
    }

    return children;
};
