import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    Briefcase,
    DollarSign,
    FileText,
    ShieldAlert,
    FileSearch,
    Plus,
    Download,
    ChevronRight,
    Loader2,
    Eye,
    X,
    Building2,
    Hash,
    MapPin,
    ShieldCheck,
    User,
    Calendar
} from 'lucide-react';
import StatCard from '../components/StatCard';
import VerifiedBadge from '../components/VerifiedBadge';
import { getInvoiceStats, getInvoices } from '../api/invoiceApi';
import { getMyWallet } from '../api/walletApi';
import { getMyOffers, acceptOffer } from '../api/offerApi';
import { getMyDeals, repayDeal, signAgreement, downloadAgreement } from '../api/dealApi';
import { useAuth } from '../context/AuthContext';
import { FeatureGuard } from '../context/FeatureContext';
import FinbridgeLoading from '../components/FinbridgeLoading';
import AgreementActions from '../components/AgreementActions';
import toast from 'react-hot-toast';

const MSMEDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // New Deal Lifecycle States
    const [wallet, setWallet] = useState({ availableBalance: 0, lockedBalance: 0, totalEarnings: 0 });
    const [offers, setOffers] = useState([]);
    const [deals, setDeals] = useState([]);
    const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
    const [isRepayingDeal, setIsRepayingDeal] = useState(false);

    // Lender Profile Modal State
    const [selectedLender, setSelectedLender] = useState(null);
    const [isSigningAgreement, setIsSigningAgreement] = useState(null);
    const [isDownloadingAgreement, setIsDownloadingAgreement] = useState(null);

    const handleSignAgreement = async (dealId) => {
        setIsSigningAgreement(dealId);
        try {
            await signAgreement(dealId);
            toast.success("Agreement signed successfully");
            await loadDashboardData();
        } catch (error) {
            toast.error(error.message || "Failed to sign agreement");
        } finally {
            setIsSigningAgreement(null);
        }
    };

    const handleDownloadAgreement = async (dealId) => {
        setIsDownloadingAgreement(dealId);
        try {
            await downloadAgreement(dealId);
        } catch (error) {
            toast.error(error.message || "Failed to download agreement");
        } finally {
            setIsDownloadingAgreement(null);
        }
    };

    const loadDashboardData = async () => {
        try {
            const [statsData, walletData, offersData, dealsData] = await Promise.all([
                getInvoiceStats().catch(() => null),
                user?.kycStatus === 'VERIFIED' ? getMyWallet().catch(() => ({ availableBalance: 0, lockedBalance: 0, totalEarnings: 0 })) : { availableBalance: 0, lockedBalance: 0, totalEarnings: 0 },
                user?.kycStatus === 'VERIFIED' ? getMyOffers().catch(() => []) : [],
                user?.kycStatus === 'VERIFIED' ? getMyDeals().catch(() => []) : []
            ]);
            if (statsData) setStats(statsData);
            setWallet(walletData || { availableBalance: 0, lockedBalance: 0, totalEarnings: 0 });
            setOffers(offersData || []);
            setDeals(dealsData || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
            setTimeout(() => setVisible(true), 20);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [user?.kycStatus]);

    const handleAcceptOffer = async (offerId) => {
        setIsAcceptingOffer(true);
        try {
            await acceptOffer(offerId);
            toast.success("Offer accepted successfully! Deal created.");
            await loadDashboardData(); // Refresh all data
        } catch (error) {
            toast.error(error.message || "Failed to accept offer");
        } finally {
            setIsAcceptingOffer(false);
        }
    };

    const handleRepayDeal = async (dealId) => {
        setIsRepayingDeal(true);
        try {
            await repayDeal(dealId);
            toast.success("Deal repaid successfully!");
            await loadDashboardData(); // Refresh all data
        } catch (error) {
            toast.error(error.message || "Failed to repay deal");
        } finally {
            setIsRepayingDeal(false);
        }
    };

    const handleExportReport = async () => {
        setIsExporting(true);
        try {
            const invoices = await getInvoices();
            if (!invoices || invoices.length === 0) {
                toast.error("No data available to export.");
                return;
            }

            // Create CSV
            const headers = ['Invoice ID', 'Amount', 'Due Date', 'Buyer GSTIN', 'Status', 'Risk Level', 'Credit Score', 'Created At'];
            const csvRows = [headers.join(',')];

            for (const inv of invoices) {
                const row = [
                    inv.id || '',
                    inv.amount || 0,
                    inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '',
                    inv.buyerGstin || '',
                    inv.status || '',
                    inv.riskLevel || 'UNKNOWN',
                    inv.creditScore !== undefined ? inv.creditScore : '',
                    inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : ''
                ];
                // Escape commas and quotes
                const escapedRow = row.map(val => `"${String(val).replace(/"/g, '""')}"`);
                csvRows.push(escapedRow.join(','));
            }

            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `monthly_summary_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Report exported successfully!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export report.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-theme-bg">
            {/* Glow blobs */}
            <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-24 w-[400px] h-[400px] bg-cyan-500 rounded-full -z-10 blur-3xl opacity-[0.08] pointer-events-none" />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-theme-bg via-theme-elevated/40 to-theme-bg -z-10 pointer-events-none" />

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {loading && <FinbridgeLoading userName={user?.name} />}
                <div
                    className="space-y-8"
                    style={{
                        opacity: (loading || !visible) ? 0 : 1,
                        transition: 'opacity 0.5s ease',
                        display: loading ? 'none' : undefined,
                    }}
                >
                    {/* Hero Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-4">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                MSME Dashboard
                            </div>
                            <h1 className="text-4xl font-semibold text-theme-text tracking-tight">
                                Welcome back,{' '}
                                <span className="text-blue-400">{user?.name || 'Partner'}</span>
                            </h1>
                            <p className="text-theme-text-muted mt-2 text-sm">Here's what's happening with your business today.</p>
                        </div>

                        {user?.kycStatus === 'VERIFIED' ? (
                            <button
                                onClick={() => navigate('/upload-invoice')}
                                className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-theme-text font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm"
                            >
                                <Plus size={15} />
                                Create Invoice
                            </button>
                        ) : (
                            <div className="shrink-0 flex flex-col items-end gap-2 text-right">
                                <button
                                    onClick={() => navigate('/kyc')}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-theme-text font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm animate-pulse"
                                >
                                    <Briefcase size={16} />
                                    Complete KYC to Unlock Features
                                </button>
                                <span className="text-amber-400/80 text-xs font-medium bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                    Current Status: {user?.kycStatus?.replace('_', ' ') || 'NOT SUBMITTED'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Revenue"
                            value={stats?.totalRevenue}
                            icon={DollarSign}
                            trend={stats?.totalRevenue !== 'â‚¹0' ? "up" : null}
                            color="success"
                        />
                        <StatCard
                            title="Total Invoices"
                            value={stats?.totalInvoices}
                            icon={FileText}
                            trend={stats?.totalInvoices > 0 ? "up" : null}
                            color="accent"
                        />
                        <StatCard
                            title="Avg Credit Score"
                            value={user?.kycStatus === 'VERIFIED' ? stats?.avgRiskScore : '---'}
                            icon={ShieldAlert}
                            color={user?.kycStatus === 'VERIFIED' ? (stats?.avgRiskScore >= 80 ? "success" : stats?.avgRiskScore >= 50 ? "warning" : "danger") : "default"}
                            className={user?.kycStatus !== 'VERIFIED' ? "blur-[2px] opacity-70" : ""}
                        />
                        <StatCard
                            title="Wallet Balance"
                            value={user?.kycStatus === 'VERIFIED' ? `₹${Number(wallet?.availableBalance || 0).toLocaleString('en-IN')}` : '---'}
                            icon={Briefcase}
                            color="accent2"
                            className={user?.kycStatus !== 'VERIFIED' ? "blur-[2px] opacity-70" : ""}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Graph */}
                        <div className="lg:col-span-2 rounded-2xl border border-theme-border bg-theme-elevated/20 backdrop-blur-xl p-6 min-w-0 shadow-lg shadow-theme-border">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-semibold text-theme-text">Revenue Trend</h2>
                                <span className="text-xs text-theme-text-muted bg-theme-surface-hover border border-theme-border px-2.5 py-1 rounded-full">Last 6 months</span>
                            </div>
                            <div className="h-60">
                                {stats?.revenueData && stats.revenueData.length > 0 && stats.revenueData.some(d => d.revenue > 0) ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <LineChart data={stats.revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={1} />
                                            <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `â‚¹${value}`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0c1526', borderColor: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '13px' }}
                                                itemStyle={{ color: '#93c5fd' }}
                                                labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                                            />
                                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-2 text-theme-text-muted">
                                        <FileText size={28} />
                                        <p className="text-sm">No revenue data available yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Risk Distribution */}
                        <div className="rounded-2xl border border-theme-border bg-theme-elevated/20 backdrop-blur-xl p-6 min-w-0 shadow-lg shadow-theme-border">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-semibold text-theme-text">Risk Distribution</h2>
                                <span className="text-xs text-theme-text-muted bg-theme-surface-hover border border-theme-border px-2.5 py-1 rounded-full">All time</span>
                            </div>
                            <div className="h-60 relative">
                                {stats?.totalInvoices > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                            <PieChart>
                                                <Pie
                                                    data={stats.riskData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={52}
                                                    outerRadius={82}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                >
                                                    {stats.riskData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0c1526', borderColor: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '13px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-2xl font-bold text-theme-text">{stats.totalInvoices}</span>
                                            <span className="text-xs text-theme-text-muted mt-0.5">invoices</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-2 text-theme-text-muted">
                                        <ShieldAlert size={28} />
                                        <p className="text-sm">No risk data calculated</p>
                                    </div>
                                )}
                            </div>
                            {stats?.totalInvoices > 0 && (
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    {stats.riskData.map((item) => (
                                        <div key={item.name} className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-theme-text-muted">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pending Offers Section */}
                    {user?.kycStatus === 'VERIFIED' && (
                        <div className="rounded-2xl border border-theme-border bg-theme-elevated/20 backdrop-blur-xl p-6 shadow-lg shadow-theme-border">
                            <h2 className="text-base font-semibold text-theme-text mb-5">Received Funding Offers</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-theme-border">
                                            {['Invoice ID', 'Offer Amount', 'Interest Rate', 'Expected Fee', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="px-4 py-3 text-xs font-semibold text-theme-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme-border">
                                        {offers.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-theme-text-muted text-sm">No pending offers received yet</td>
                                            </tr>
                                        ) : offers.map((offer) => (
                                            <tr key={offer.id} className="hover:bg-theme-surface-hover transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-400">
                                                    #{offer.invoice?.invoice_number || offer.invoiceId.substring(0, 6)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-theme-text">
                                                    ₹{Number(offer.fundedAmount).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">{offer.interestRate}% p.a.</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">
                                                    ₹{Number(offer.platformFee).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                        {offer.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedLender(offer.lender)}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-500/20 text-theme-text-muted hover:bg-slate-500/30 hover:text-theme-text transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Eye size={13} /> View
                                                        </button>
                                                        <button
                                                            onClick={() => handleAcceptOffer(offer.id)}
                                                            disabled={isAcceptingOffer}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                                                        >
                                                            {isAcceptingOffer ? 'Accepting...' : 'Accept Offer'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Active Deals Section */}
                    {user?.kycStatus === 'VERIFIED' && (
                        <div className="rounded-2xl border border-theme-border bg-theme-elevated/20 backdrop-blur-xl p-6 shadow-lg shadow-theme-border">
                            <h2 className="text-base font-semibold text-theme-text mb-5">Active Deals & Repayments</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-theme-border">
                                            {['Invoice ID', 'Funded Amount', 'Interest', 'Platform Fee', 'Due Date', 'Agreement', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="px-4 py-3 text-xs font-semibold text-theme-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme-border">
                                        {deals.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-theme-text-muted text-sm">No deals found</td>
                                            </tr>
                                        ) : deals.map((deal) => (
                                            <tr key={deal.id} className="hover:bg-theme-surface-hover transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-400">
                                                    #{deal.invoice?.invoice_number || deal.invoiceId.substring(0, 6)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-theme-text">
                                                    ₹{Number(deal.fundedAmount).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">
                                                    ₹{Number(deal.interestAmount).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">
                                                    ₹{Number(deal.platformFee).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">
                                                    {new Date(deal.dueDate).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <AgreementActions
                                                        isSigned={deal.lenderSigned && deal.msmeSigned}
                                                        isDownloading={isDownloadingAgreement === deal.id}
                                                        isSigning={isSigningAgreement === deal.id}
                                                        onDownload={() => handleDownloadAgreement(deal.id)}
                                                        onSign={() => handleSignAgreement(deal.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${deal.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                        {deal.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {deal.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => handleRepayDeal(deal.id)}
                                                            disabled={isRepayingDeal || wallet.availableBalance < deal.totalPayableToLender}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                                                            title={wallet.availableBalance < deal.totalPayableToLender ? "Insufficient wallet balance" : "Repay this deal"}
                                                        >
                                                            {isRepayingDeal ? 'Processing...' : 'Repay Deal'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="rounded-2xl border border-theme-border bg-theme-elevated/20 backdrop-blur-xl p-6 relative overflow-hidden shadow-lg shadow-theme-border">
                        {user?.kycStatus !== 'VERIFIED' && (
                            <div className="absolute inset-0 bg-theme-bg/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                                <div className="bg-theme-surface border border-amber-500/20 rounded-xl p-4 flex flex-col items-center gap-2 shadow-2xl">
                                    <ShieldAlert className="text-amber-500" size={24} />
                                    <p className="text-theme-text text-sm font-medium">Verification Required</p>
                                    <p className="text-theme-text-muted text-xs text-center">Complete your KYC to unlock invoice creation<br />and other platform features.</p>
                                    <button
                                        onClick={() => navigate('/kyc')}
                                        className="mt-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        Go to KYC Setup
                                    </button>
                                </div>
                            </div>
                        )}
                        <h2 className="text-base font-semibold text-theme-text mb-5">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FeatureGuard featureKey="INVOICE_MANAGEMENT_MODULE">
                                <button
                                    onClick={() => navigate('/upload-invoice')}
                                    disabled={user?.kycStatus !== 'VERIFIED'}
                                    className={`group text-left p-5 rounded-2xl border border-theme-border bg-transparent transition-all duration-200 ${user?.kycStatus === 'VERIFIED'
                                        ? 'hover:bg-theme-surface-hover hover:-translate-y-0.5'
                                        : 'opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                            <Plus size={18} />
                                        </div>
                                        <ChevronRight size={15} className="text-theme-text-muted group-hover:text-theme-text-muted transition-colors mt-1" />
                                    </div>
                                    <h3 className="font-medium text-theme-text text-sm mb-1">Create Invoice</h3>
                                    <p className="text-xs text-theme-text-muted leading-relaxed">Submit a new invoice for financing</p>
                                </button>
                            </FeatureGuard>

                            <button
                                onClick={() => navigate('/invoices')}
                                disabled={user?.kycStatus !== 'VERIFIED'}
                                className={`group text-left p-5 rounded-2xl border border-theme-border bg-transparent transition-all duration-200 ${user?.kycStatus === 'VERIFIED'
                                    ? 'hover:bg-theme-surface-hover hover:-translate-y-0.5'
                                    : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                        <FileSearch size={18} />
                                    </div>
                                    <ChevronRight size={15} className="text-theme-text-muted group-hover:text-theme-text-muted transition-colors mt-1" />
                                </div>
                                <h3 className="font-medium text-theme-text text-sm mb-1">View All Invoices</h3>
                                <p className="text-xs text-theme-text-muted leading-relaxed">Check status and history</p>
                            </button>

                            <button
                                onClick={handleExportReport}
                                disabled={user?.kycStatus !== 'VERIFIED' || isExporting}
                                className={`group text-left p-5 rounded-2xl border border-theme-border bg-transparent transition-all duration-200 ${user?.kycStatus === 'VERIFIED' && !isExporting
                                    ? 'hover:bg-theme-surface-hover hover:-translate-y-0.5'
                                    : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                    </div>
                                    <ChevronRight size={15} className="text-theme-text-muted group-hover:text-theme-text-muted transition-colors mt-1" />
                                </div>
                                <h3 className="font-medium text-theme-text text-sm mb-1">{isExporting ? 'Exporting...' : 'Export Report'}</h3>
                                <p className="text-xs text-theme-text-muted leading-relaxed">Download monthly summary</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lender Profile Modal */}
            {selectedLender && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLender(null)} />
                    <div className="relative w-full max-w-lg bg-theme-surface border border-theme-border rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">

                        {/* Header */}
                        <div className="p-5 border-b border-theme-border flex items-start justify-between bg-gradient-to-r from-blue-900/20 to-transparent rounded-t-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-theme-text leading-tight w-64 truncate">
                                            {selectedLender.kyc?.organizationName || selectedLender.name}
                                        </h2>
                                        {selectedLender.kyc?.isVerified && <VerifiedBadge size={16} />}
                                    </div>
                                    <p className="text-sm text-theme-text-muted mt-0.5 capitalize">
                                        {selectedLender.kyc?.lenderType?.replace(/_/g, ' ') || 'Investor Profile'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLender(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-theme-text-muted hover:text-theme-text transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-theme-text uppercase tracking-wider mb-4 text-blue-400 flex items-center gap-2">
                                <ShieldCheck size={16} /> Verified Profile Details
                            </h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col p-3 rounded-lg bg-theme-surface-hover border border-theme-border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Hash size={13} className="text-theme-text-muted" />
                                            <p className="text-xs text-theme-text-muted">Entity / User Name</p>
                                        </div>
                                        <p className="text-sm font-medium text-theme-text truncate">{selectedLender.kyc?.organizationName || selectedLender.name}</p>
                                    </div>

                                    {selectedLender.kyc?.contactPersonName && (
                                        <div className="flex flex-col p-3 rounded-lg bg-theme-surface-hover border border-theme-border">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User size={13} className="text-theme-text-muted" />
                                                <p className="text-xs text-theme-text-muted">Contact Person</p>
                                            </div>
                                            <p className="text-sm font-medium text-theme-text">{selectedLender.kyc.contactPersonName}</p>
                                        </div>
                                    )}

                                    {selectedLender.kyc?.gstNumber && (
                                        <div className="flex flex-col p-3 rounded-lg bg-theme-surface-hover border border-theme-border">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Hash size={13} className="text-theme-text-muted" />
                                                <p className="text-xs text-theme-text-muted">GST Number</p>
                                            </div>
                                            <p className="text-sm font-medium text-theme-text font-mono truncate">{selectedLender.kyc.gstNumber}</p>
                                        </div>
                                    )}

                                    {selectedLender.kyc?.capitalRange && (
                                        <div className="flex flex-col p-3 rounded-lg bg-theme-surface-hover border border-theme-border">
                                            <div className="flex items-center gap-2 mb-1">
                                                <DollarSign size={13} className="text-emerald-500/80" />
                                                <p className="text-xs text-theme-text-muted">Capital Range</p>
                                            </div>
                                            <p className="text-sm font-medium text-emerald-400">{selectedLender.kyc.capitalRange}</p>
                                        </div>
                                    )}
                                </div>

                                {(selectedLender.kyc?.panNumber) && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-theme-surface-hover border border-theme-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-theme-bg flex items-center justify-center text-theme-text-muted border border-theme-border">
                                                <Hash size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-theme-text-muted">PAN Record</p>
                                                <p className="text-sm font-medium text-theme-text tracking-wider">{selectedLender.kyc?.panNumber || 'Available'}</p>
                                            </div>
                                        </div>
                                        {selectedLender.kyc?.isPanVerified ? (
                                            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Verified</span>
                                        ) : (
                                            <span className="text-xs font-semibold bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Pending</span>
                                        )}
                                    </div>
                                )}

                                {selectedLender.kyc?.rbiLicenseNumber && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-theme-surface-hover border border-emerald-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                <Building2 size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-emerald-400/80">RBI License Number</p>
                                                <p className="text-sm font-medium text-emerald-400 tracking-wider font-mono">{selectedLender.kyc.rbiLicenseNumber}</p>
                                            </div>
                                        </div>
                                        {selectedLender.kyc?.isRbiVerified && <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Verified</span>}
                                    </div>
                                )}

                                {selectedLender.kyc?.registrationNumber && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-theme-surface-hover border border-theme-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-theme-bg flex items-center justify-center text-theme-text-muted border border-theme-border">
                                                <Hash size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-theme-text-muted">Entity Registration ID</p>
                                                <p className="text-sm font-medium text-theme-text tracking-wider font-mono">{selectedLender.kyc.registrationNumber}</p>
                                            </div>
                                        </div>
                                        {selectedLender.kyc?.isMcaVerified && <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Verified</span>}
                                    </div>
                                )}

                                {selectedLender.kyc?.riskPreference && (
                                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-theme-surface-hover border border-theme-border">
                                        <span className="text-xs text-theme-text-muted">Lender Funding Strategy</span>
                                        <p className="text-sm text-theme-text">{selectedLender.kyc?.riskPreference} Focus</p>
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="p-4 border-t border-theme-border bg-theme-surface-hover rounded-b-2xl text-center">
                            <p className="text-xs text-theme-text-muted flex items-center justify-center gap-2">
                                <ShieldCheck size={14} className="text-blue-400" /> FinBridge validates lender credentials for secure operations.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MSMEDashboard;
