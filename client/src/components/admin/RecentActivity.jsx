import { Building2, FileText, TrendingUp, CheckCircle } from 'lucide-react';

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            icon: Building2,
            title: 'New MSME Registered',
            description: 'TechStart Solutions registered',
            time: '2 hours ago',
            color: '#3B82F6',
        },
        {
            id: 2,
            icon: FileText,
            title: 'Invoice Uploaded',
            description: 'Invoice INV-2024-001 uploaded',
            time: '4 hours ago',
            color: '#8B5CF6',
        },
        {
            id: 3,
            icon: TrendingUp,
            title: 'New Bid Placed',
            description: 'Lender bid ₹5,00,000 on invoice',
            time: '6 hours ago',
            color: '#06B6D4',
        },
        {
            id: 4,
            icon: CheckCircle,
            title: 'Transaction Approved',
            description: 'Transaction TXN-2024-156 approved',
            time: '8 hours ago',
            color: '#22C55E',
        },
    ];

    return (
        <div className="activity-panel">
            <h3 className="panel-title">Recent Activity</h3>
            <div className="activity-list">
                {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                        <div
                            className="activity-icon"
                            style={{ '--accent-color': activity.color }}
                        >
                            <activity.icon size={18} />
                        </div>
                        <div className="activity-content">
                            <div className="activity-title">{activity.title}</div>
                            <div className="activity-desc">{activity.description}</div>
                        </div>
                        <div className="activity-time">{activity.time}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
