import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Menu } from 'lucide-react';

const AdminHeader = ({ title, onToggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="admin-header">
            <div className="header-left">
                <button className="menu-toggle" onClick={onToggleSidebar}>
                    <Menu size={24} />
                </button>
                <h1 className="page-title">{title}</h1>
            </div>

            <div className="header-right">
                {/* Search Bar */}
                <div className="search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search users, invoices..."
                        className="search-input"
                    />
                </div>

                {/* Notifications */}
                <button className="header-icon-btn">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>

                {/* Profile Chip */}
                <div className="profile-chip">
                    <div className="avatar">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="profile-info">
                        <div className="profile-name">{user?.name || 'Admin User'}</div>
                        <div className="profile-role">Administrator</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
