import { AlertTriangle, AlertCircle, Shield } from 'lucide-react';

const RiskAlerts = () => {
    const alerts = [
        {
            id: 1,
            type: 'critical',
            title: 'High-Risk Invoice',
            description: 'Invoice INV-2024-089 flagged for review',
            icon: AlertTriangle,
        },
        {
            id: 2,
            type: 'warning',
            title: 'Failed Login Attempts',
            description: '5 failed login attempts detected',
            icon: AlertCircle,
        },
        {
            id: 3,
            type: 'warning',
            title: 'Duplicate GSTIN',
            description: 'Company XYZ has duplicate GSTIN registered',
            icon: Shield,
        },
    ];

    return (
        <div className="alert-panel">
            <h3 className="panel-title">Risk & Fraud Alerts</h3>
            <div className="alert-list">
                {alerts.map((alert) => (
                    <div key={alert.id} className={`alert-item ${alert.type}`}>
                        <div className="alert-icon">
                            <alert.icon size={18} />
                        </div>
                        <div className="alert-content">
                            <div className="alert-title">{alert.title}</div>
                            <div className="alert-desc">{alert.description}</div>
                        </div>
                        <div className="alert-badge">{alert.type}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskAlerts;
