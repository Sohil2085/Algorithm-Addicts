import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '2rem', color: 'white' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.name}!</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    flex: 1
                }}>
                    <h3>User Management</h3>
                    <p>Manage MSMEs and Lenders.</p>
                </div>
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    flex: 1
                }}>
                    <h3>System Settings</h3>
                    <p>Configure platform settings.</p>
                </div>
            </div>
            <button
                onClick={handleLogout}
                style={{
                    marginTop: '2rem',
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Logout
            </button>
        </div>
    );
};

export default AdminDashboard;