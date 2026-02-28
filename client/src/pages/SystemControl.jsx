import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const SystemControl = () => {
    const { user, token, logout } = useAuth();
    const { features, refreshFeatures, loading } = useFeatures();
    const navigate = useNavigate();

    useEffect(() => {
        // Enforce Controller Role explicitly even if ProtectedRoute does it
        if (!user || user.role !== 'CONTROLLER') {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleToggle = async (featureKey, currentValue) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://algorithm-addicts.onrender.com/api' : 'http://localhost:5000/api');
            const response = await axios.patch(
                `${API_BASE_URL}/features/admin/${featureKey}`,
                { isEnabled: !currentValue },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success(`${featureKey} has been ${!currentValue ? 'enabled' : 'disabled'}.`);
                refreshFeatures(); // Re-fetch all features
            }
        } catch (error) {
            toast.error('Failed to update feature toggle.');
            console.error(error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading || !user) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">System Control Panel</h1>
                        <p className="mt-2 text-sm text-slate-400">Master Governance Dashboard: Enable/Disable Application Modules</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="bg-slate-900 shadow rounded-2xl border border-slate-800 overflow-hidden">
                    <ul className="divide-y divide-slate-800">
                        {Object.entries(features).map(([key, isEnabled]) => (
                            <li key={key} className="p-6 hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">{key.replace(/_/g, ' ')}</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Currently <span className={isEnabled ? 'text-green-400' : 'text-red-400 font-semibold'}>{isEnabled ? 'Active' : 'Disabled'}</span>
                                    </p>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleToggle(key, isEnabled)}
                                        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isEnabled ? 'bg-blue-600' : 'bg-slate-700'
                                            }`}
                                    >
                                        <span className="sr-only">Toggle {key}</span>
                                        <span
                                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-7' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SystemControl;
