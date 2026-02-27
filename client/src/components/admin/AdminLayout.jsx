import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../../styles/admin.css';

const AdminLayout = ({ title, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="admin-container">
            <AdminSidebar open={sidebarOpen} />
            <div className="admin-main">
                <AdminHeader title={title} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
