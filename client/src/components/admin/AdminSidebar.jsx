import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    BarChart3,
    Users,
    FileText,
    TrendingUp,
    CreditCard,
    AlertCircle,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
} from 'lucide-react';

const AdminSidebar = ({ open }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuItems = [
        { icon: BarChart3, label: 'Overview', path: '/admin' },
        { icon: ShieldCheck, label: 'MSME Verification', path: '/admin/kyc' },
        { icon: FileText, label: 'Lender Verification', path: '/admin/lender-kyc' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: FileText, label: 'Invoices', path: '/admin/invoices' },
        { icon: TrendingUp, label: 'Bids & Funding', path: '/admin/bids' },
        { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
        { icon: AlertCircle, label: 'Risk & Fraud', path: '/admin/alerts' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`admin-sidebar ${open ? 'open' : 'closed'}`}>
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="brand-icon">FB</div>
                <div>
                    <div className="brand-name">FinBridge</div>
                    <div className="brand-role">Admin</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        className="nav-item"
                        onClick={() => navigate(item.path)}
                        title={item.label}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
