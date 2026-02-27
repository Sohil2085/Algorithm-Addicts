const KPICard = ({ title, value, icon: Icon, subtitle, trend }) => {
    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <div>
                    <div className="kpi-title">{title}</div>
                    {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
                </div>
                <div className="kpi-icon">
                    <Icon size={24} />
                </div>
            </div>

            <div className="kpi-value">{value}</div>

            {trend && (
                <div className={`kpi-trend ${trend.positive ? 'positive' : 'negative'}`}>
                    {trend.text}
                </div>
            )}
        </div>
    );
};

export default KPICard;
