import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>
                Project Morpheus
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                {user.role === 'MSME' && (
                    <>
                        <Link to="/msme">Dashboard</Link>
                        <Link to="/upload-invoice">Upload Invoice</Link>
                        <Link to="/analytics">Analytics</Link>
                    </>
                )}
                {user.role === 'LENDER' && (
                    <>
                        <Link to="/lender">Dashboard</Link>
                        <Link to="/analytics">Analytics</Link>
                    </>
                )}
                <button onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;