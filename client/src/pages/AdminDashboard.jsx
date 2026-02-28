import AdminLayout from '../components/admin/AdminLayout';
import KPICard from '../components/admin/KPICard';
import RecentActivity from '../components/admin/RecentActivity';
import RiskAlerts from '../components/admin/RiskAlerts';
import AdminTables from '../components/admin/AdminTables';
import AdminRecordings from '../components/admin/AdminRecordings';
import {
    Building2,
    Briefcase,
    FileText,
    TrendingUp,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAdminStats } from '../api/adminApi';
import { FeatureGuard } from '../context/FeatureContext';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalMsmes: 0,
        totalLenders: 0,
        totalInvoices: 0,
        totalFunding: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getAdminStats();
                if (response.success && response.data) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Failed to load admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Format funding string. If > 1 Crore, show in Cr. If > 1 Lakh, show in L. Else raw with commas.
    const formatFunding = (amount) => {
        if (!amount) return '₹0';
        const num = Number(amount);
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
        return `₹${num.toLocaleString()}`;
    };

    const kpiData = [
        {
            title: 'Total MSMEs',
            value: loading ? '...' : stats.totalMsmes.toLocaleString(),
            icon: Building2,
            subtitle: 'Active businesses',
            trend: { text: '+12% this month', positive: true },
        },
        {
            title: 'Total Lenders',
            value: loading ? '...' : stats.totalLenders.toLocaleString(),
            icon: Briefcase,
            subtitle: 'Investment partners',
            trend: { text: '+8% this month', positive: true },
        },
        {
            title: 'Total Invoices',
            value: loading ? '...' : stats.totalInvoices.toLocaleString(),
            icon: FileText,
            subtitle: 'Uploaded & tracked',
            trend: { text: '-3% this month', positive: false },
        },
        {
            title: 'Total Funding',
            value: loading ? '...' : formatFunding(stats.totalFunding),
            icon: TrendingUp,
            subtitle: 'Disbursed amount',
            trend: { text: '+24% this month', positive: true },
        },
    ];

    return (
        <AdminLayout title="Overview">
            {/* KPI Cards */}
            <section className="admin-section">
                <div className="kpi-grid">
                    {kpiData.map((kpi) => (
                        <KPICard
                            key={kpi.title}
                            title={kpi.title}
                            value={kpi.value}
                            icon={kpi.icon}
                            subtitle={kpi.subtitle}
                            trend={kpi.trend}
                        />
                    ))}
                </div>
            </section>

            {/* Activity & Alerts Section */}
            <section className="admin-section">
                <div className="two-column-grid">
                    <RecentActivity />
                    <RiskAlerts />
                </div>
            </section>

            {/* Pending MSME KYC Section Link */}
            <section className="admin-section">
                <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 opacity-50"></div>
                    <div className="flex items-center gap-6 z-10">
                        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/30">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-theme-text mb-2">MSME Verification Center</h2>
                            <p className="text-white/60 text-sm max-w-lg leading-relaxed">
                                Review new MSME onboarding requests, verify GST & PAN details against official databases, and manage approvals in a dedicated workspace.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/kyc"
                        className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-theme-text px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 group z-10"
                    >
                        Launch Verification System
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Pending Lender KYC Section Link */}
            <section className="admin-section">
                <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 opacity-50"></div>
                    <div className="flex items-center gap-6 z-10">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <Briefcase size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-theme-text mb-2">Lender Verification Center</h2>
                            <p className="text-white/60 text-sm max-w-lg leading-relaxed">
                                Review new Lender profiles, cross-reference RBI and corporate identities, and grant marketplace access securely.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/lender-kyc"
                        className="shrink-0 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-theme-text px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 group z-10"
                    >
                        Launch Lender Verification
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Tables Section */}
            <section className="admin-section">
                <AdminTables />
            </section>

            {/* Call Recordings Section */}
            <FeatureGuard featureKey="COMMUNICATION_MODULE">
                <section className="admin-section">
                    <AdminRecordings />
                </section>
            </FeatureGuard>
        </AdminLayout>
    );
};

export default AdminDashboard;
