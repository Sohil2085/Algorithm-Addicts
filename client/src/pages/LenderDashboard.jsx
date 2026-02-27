import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    DollarSign, TrendingUp, Briefcase, ShieldAlert,
    AlertTriangle, Search, Filter, Eye, Zap,
    Video, Clock, CheckCircle, XCircle, BarChart2,
    ChevronRight, X, FileText, Download, ExternalLink,
    Building, AlertOctagon, Calendar, PieChart as PieChartIcon,
    ArrowUpRight, ArrowDownRight, ShieldCheck, LockKeyhole
} from 'lucide-react';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';
import FinbridgeLoading from '../components/FinbridgeLoading';
import toast from 'react-hot-toast';
import { getAvailableInvoices } from '../api/invoiceApi';
import { getMyWallet } from '../api/walletApi';
import { createOffer } from '../api/offerApi';
import { getMyDeals, fundDeal } from '../api/dealApi';
import '../styles/landing.css';
// ─── Static Dummy Data ────────────────────────────────────────────────────────
// TODO: Replace with API calls when backend bidding endpoints are ready

const DUMMY_PORTFOLIO_TREND = [
    { month: 'Sep', invested: 180000, returns: 12600 },
    { month: 'Oct', invested: 240000, returns: 18200 },
    { month: 'Nov', invested: 310000, returns: 24800 },
    { month: 'Dec', invested: 275000, returns: 22000 },
    { month: 'Jan', invested: 420000, returns: 35700 },
    { month: 'Feb', invested: 510000, returns: 45900 },
];

const DUMMY_RISK_DISTRIBUTION = [
    { name: 'Low Risk', value: 54, color: '#22c55e' },
    { name: 'Medium Risk', value: 31, color: '#f59e0b' },
    { name: 'High Risk', value: 15, color: '#ef4444' },
];

const DUMMY_DEFAULT_PROB = [
    { tier: 'LOW', probability: 2.1 },
    { tier: 'MEDIUM', probability: 8.4 },
    { tier: 'HIGH', probability: 21.7 },
];

const DUMMY_AVAILABLE_INVOICES = [
    { id: 'a3f9b1', msmeName: 'Apex Textiles Pvt. Ltd.', amount: 480000, dueDate: '2026-03-15', creditScore: 84, riskLevel: 'LOW', expectedReturn: 9.2 },
    { id: 'b7d2c4', msmeName: 'Nova Steel Works', amount: 125000, dueDate: '2026-03-08', creditScore: 61, riskLevel: 'MEDIUM', expectedReturn: 13.5 },
    { id: 'c1e8a5', msmeName: 'Sunrise Agro Foods', amount: 92000, dueDate: '2026-02-28', creditScore: 43, riskLevel: 'HIGH', expectedReturn: 19.8 },
    { id: 'd6f3b9', msmeName: 'BlueLine Logistics', amount: 670000, dueDate: '2026-04-01', creditScore: 91, riskLevel: 'LOW', expectedReturn: 8.1 },
    { id: 'e2a7d1', msmeName: 'Crestwood Electronics', amount: 215000, dueDate: '2026-03-22', creditScore: 73, riskLevel: 'MEDIUM', expectedReturn: 11.9 },
    { id: 'f9c4e6', msmeName: 'Vega Pharma Supplies', amount: 340000, dueDate: '2026-03-30', creditScore: 88, riskLevel: 'LOW', expectedReturn: 8.7 },
];

const DUMMY_MY_INVESTMENTS = [
    { id: 'a3f9b1', msmeName: 'Apex Textiles Pvt. Ltd.', invested: 200000, interestRate: 9.2, expectedReturn: 18400, dueDate: '2026-03-15', daysRemaining: 23, status: 'ACTIVE' },
    { id: 'd6f3b9', msmeName: 'BlueLine Logistics', invested: 350000, interestRate: 8.1, expectedReturn: 28350, dueDate: '2026-04-01', daysRemaining: 40, status: 'ACTIVE' },
    { id: 'g4h2i7', msmeName: 'Kiran Auto Parts', invested: 90000, interestRate: 14.5, expectedReturn: 13050, dueDate: '2026-01-20', daysRemaining: 0, status: 'SETTLED' },
    { id: 'h5j3k8', msmeName: 'Delta Garments', invested: 60000, interestRate: 22.0, expectedReturn: 13200, dueDate: '2026-01-05', daysRemaining: 0, status: 'DEFAULTED' },
];

const DUMMY_MEETINGS = [
    { invoiceId: 'a3f9b1', msmeName: 'Apex Textiles Pvt. Ltd.', meetingDate: '2026-02-18', duration: '32 min', recordingStatus: 'AVAILABLE' },
    { invoiceId: 'b7d2c4', msmeName: 'Nova Steel Works', meetingDate: '2026-02-19', duration: '21 min', recordingStatus: 'PROCESSING' },
    { invoiceId: 'e2a7d1', msmeName: 'Crestwood Electronics', meetingDate: '2026-02-15', duration: '45 min', recordingStatus: 'AVAILABLE' },
];

const DUMMY_SECTOR_DATA = [
    { name: 'Textiles', value: 35, color: '#3b82f6' },
    { name: 'Logistics', value: 25, color: '#10b981' },
    { name: 'Pharma', value: 20, color: '#f59e0b' },
    { name: 'Manufacturing', value: 15, color: '#6366f1' },
    { name: 'Agro', value: 5, color: '#8b5cf6' },
];

const DUMMY_ROI_BENCHMARK = [
    { month: 'Sep', portfolio: 8.2, benchmark: 6.5 },
    { month: 'Oct', portfolio: 9.1, benchmark: 6.5 },
    { month: 'Nov', portfolio: 10.4, benchmark: 6.8 },
    { month: 'Dec', portfolio: 11.2, benchmark: 7.0 },
    { month: 'Jan', portfolio: 10.8, benchmark: 7.1 },
    { month: 'Feb', portfolio: 12.4, benchmark: 7.2 },
];

const DUMMY_INVOICE_DETAILS = {
    'a3f9b1': {
        founded: '2015',
        employees: '120-150',
        location: 'Surat, Gujarat',
        gstin: '24AAACA1234A1Z5',
        sector: 'Textiles',
        description: 'Manufacturer of high-quality cotton and synthetic fabrics for export markets.',
        financials: { revenue: '₹42 Cr', profit: '₹3.8 Cr', yoyGrowth: '+12%' },
        documents: ['Invoice-INV-2026-001.pdf', 'E-Way-Bill-827364.pdf', 'Purchase-Order.pdf'],
        fraudCheck: { status: 'PASSED', score: 98, flags: [] },
        repaymentHistory: { onTime: 95, late: 5, default: 0 }
    },
    'b7d2c4': {
        founded: '2018',
        employees: '40-60',
        location: 'Pune, Maharashtra',
        gstin: '27AABCN5678B1Z2',
        sector: 'Manufacturing',
        description: 'Specialized steel components for automotive industry.',
        financials: { revenue: '₹18 Cr', profit: '₹1.2 Cr', yoyGrowth: '+8%' },
        documents: ['Invoice-9928.pdf', 'Delivery-Challan.pdf'],
        fraudCheck: { status: 'WARNING', score: 82, flags: ['Address verification pending'] },
        repaymentHistory: { onTime: 88, late: 12, default: 0 }
    }
};

// ─── Helper Components ────────────────────────────────────────────────────────

const PremiumStatCard = ({ title, value, icon: Icon, trend, trendValue }) => {
    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 transition-all duration-300 hover:bg-white/7 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon size={20} className="text-blue-400" />
                </div>
                {trendValue && (
                    <span className="text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <ArrowUpRight size={12} /> {trendValue}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs tracking-widest text-white/45 uppercase mb-1">{title}</p>
                <p className="text-3xl font-semibold text-white">{value}</p>
            </div>
        </div>
    );
};

const InvestmentStatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: 'bg-success/10 text-success border border-success/20',
        SETTLED: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
        DEFAULTED: 'bg-danger/10 text-danger border border-danger/20',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.SETTLED}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
};

const RecordingStatusBadge = ({ status }) => {
    if (status === 'AVAILABLE') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                <CheckCircle size={11} /> Available
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
            <Clock size={11} /> Processing
        </span>
    );
};

// ─── Tab Definitions ──────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'marketplace', label: 'Available Invoices', icon: Zap },
    { id: 'investments', label: 'My Investments', icon: Briefcase },
    { id: 'meetings', label: 'Meeting Records', icon: Video },
    { id: 'analytics', label: 'Risk Analytics', icon: ShieldAlert },
];

// ─── Component: Invoice Detail Panel ──────────────────────────────────────────

const InvoiceDetailPanel = ({ invoice, onClose, onFundInvoice }) => {
    if (!invoice) return null;

    const isMock = invoice.expectedReturn !== undefined && !invoice.original;
    const dummyDetails = isMock ? (DUMMY_INVOICE_DETAILS[invoice.id] || DUMMY_INVOICE_DETAILS['a3f9b1']) : null;

    // Extract real info based on backend structure
    const kyc = !isMock && invoice.original?.user?.kyc ? invoice.original.user.kyc : {};
    const msmeName = kyc.businessName || kyc.legalName || invoice.msmeName || 'Unknown MSME';
    const sector = !isMock ? 'General Sector' : dummyDetails.sector;
    const location = kyc.stateCode ? `State Code: ${kyc.stateCode}` : (isMock ? dummyDetails.location : 'India');
    const revenueStr = kyc.turnover ? `₹${(kyc.turnover / 100000).toFixed(1)}L` : (isMock ? dummyDetails.financials.revenue : 'N/A');
    const expectedReturnStr = invoice.expectedReturn || (invoice.riskLevel === 'HIGH' ? 18.5 : invoice.riskLevel === 'MEDIUM' ? 14.0 : 9.5);

    // Fraud checks formatting
    const isFraudWarning = invoice.fraudScore > 20;
    const fraudStatusText = isFraudWarning ? 'WARNING' : 'PASSED';

    let fraudFlags = isMock ? dummyDetails.fraudCheck.flags : [];
    if (!isMock && invoice.breakdown?.fraudChecks) {
        fraudFlags = Object.entries(invoice.breakdown.fraudChecks)
            .filter(([k, v]) => !v)
            .map(([k]) => k.replace(/_/g, ' '));
    }

    const docs = isMock ? dummyDetails.documents : ['Invoice_Copy.pdf', 'GST_Certificate.pdf'];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-2xl h-full bg-[#0F172A] border-l border-cardBorder shadow-2xl flex flex-col animate-slide-in-right overflow-y-auto">

                {/* Header */}
                <div className="p-6 border-b border-cardBorder flex items-start justify-between bg-bg0/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">#{invoice.id.substring(0, 8)}</span>
                            <span className="text-xs text-muted flex items-center gap-1"><Clock size={12} /> Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white leading-tight">{msmeName}</h2>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted">
                            <Building size={14} /> {sector} • {location}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                            <p className="text-xs text-muted uppercase tracking-wider mb-1">Invoice Amount</p>
                            <p className="text-2xl font-bold text-white">₹{Number(invoice.amount).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                            <p className="text-xs text-muted uppercase tracking-wider mb-1">Expected Return</p>
                            <p className="text-2xl font-bold text-success">{expectedReturnStr}%</p>
                        </div>
                    </div>

                    {/* Risk & Fraud Check */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-accent" /> Risk Assessment
                        </h3>
                        <div className="bg-card border border-cardBorder rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted">Credit Score</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-bg0 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-danger via-warning to-success" style={{ width: `${invoice.creditScore}%` }} />
                                    </div>
                                    <span className="text-sm font-bold text-white">{invoice.creditScore}/100</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-cardBorder pt-4">
                                <span className="text-sm text-muted">Fraud Check</span>
                                <span className={`flex items-center gap-1.5 text-sm font-semibold ${fraudStatusText === 'PASSED' ? 'text-success' : 'text-warning'}`}>
                                    {fraudStatusText === 'PASSED' ? <CheckCircle size={14} /> : <AlertOctagon size={14} />}
                                    {fraudStatusText}
                                </span>
                            </div>
                            {fraudFlags.length > 0 && (
                                <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex items-start gap-2">
                                    <AlertTriangle size={14} className="text-warning mt-0.5 min-w-fit" />
                                    <div className="flex flex-col gap-1">
                                        {fraudFlags.map((flag, idx) => (
                                            <p key={idx} className="text-xs text-warning/90 capitalize">{flag}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Company Financials */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <PieChartIcon size={16} className="text-accent" /> Financial Snapshot
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-bg0 rounded-lg border border-cardBorder text-center">
                                <p className="text-xs text-muted mb-1">Annual Revenue</p>
                                <p className="text-sm font-semibold text-white">{revenueStr}</p>
                            </div>
                            <div className="p-3 bg-bg0 rounded-lg border border-cardBorder text-center line-through opacity-50" title="Not available in current integration">
                                <p className="text-xs text-muted mb-1">Net Profit</p>
                                <p className="text-sm font-semibold text-white">N/A</p>
                            </div>
                            <div className="p-3 bg-bg0 rounded-lg border border-cardBorder text-center line-through opacity-50" title="Not available in current integration">
                                <p className="text-xs text-muted mb-1">YoY Growth</p>
                                <p className="text-sm font-semibold text-success">N/A</p>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText size={16} className="text-accent" /> Verified Documents
                        </h3>
                        <div className="space-y-2">
                            {docs.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-card border border-cardBorder rounded-lg hover:border-accent/40 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{doc}</span>
                                    </div>
                                    <Download size={16} className="text-muted group-hover:text-accent transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-cardBorder bg-bg0/50 backdrop-blur-md sticky bottom-0 mt-auto">
                    <button
                        onClick={() => {
                            if (onFundInvoice) {
                                onFundInvoice(invoice);
                            }
                        }}
                        className="btn-primary py-3.5 text-base shadow-lg shadow-accent/20"
                    >
                        Fund This Invoice <ArrowUpRight size={18} />
                    </button>
                    <p className="text-xs text-center text-muted mt-3 flex items-center justify-center gap-1">
                        <ShieldAlert size={12} /> FinBridge Guarantee applies to Low Risk invoices
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─── Section Components ───────────────────────────────────────────────────────

const OverviewSection = ({ onExploreMarketplace, wallet, myDeals }) => {
    const totalInvested = myDeals.reduce((sum, deal) => sum + parseFloat(deal.fundedAmount), 0);
    const activeDeals = myDeals.filter(d => d.status === 'ACTIVE').length;
    const totalReturns = myDeals.reduce((sum, deal) => sum + parseFloat(deal.interestAmount), 0);

    return (
        <div className="space-y-8">
            {/* KPI Summary Cards — 4 metrics as per spec */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumStatCard title="Total Funds Invested" value={`₹${Number(totalInvested).toLocaleString('en-IN')}`} icon={TrendingUp} trend="up" trendValue="+18%" />
                <PremiumStatCard title="Active Deals" value={activeDeals.toString()} icon={Briefcase} />
                <PremiumStatCard title="Total Returns Earned" value={`₹${Number(totalReturns).toLocaleString('en-IN')}`} icon={DollarSign} trend="up" trendValue="+12.4%" />
                <PremiumStatCard title="Available Wallet Balance" value={`₹${Number(wallet?.availableBalance || 0).toLocaleString('en-IN')}`} icon={ArrowUpRight} trend="up" trendValue="+₹5L" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Investment Over Time */}
                <div className="lg:col-span-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 transition-all duration-300 hover:bg-white/7 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-xl min-w-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Investment Over Time</h2>
                            <p className="text-xs text-white/45 mt-0.5">6-month investment growth trend</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10">+8.7% avg</span>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <LineChart data={DUMMY_PORTFOLIO_TREND}>
                                <defs>
                                    <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="returnsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(v, name) => [`₹${Number(v).toLocaleString('en-IN')}`, name === 'invested' ? 'Invested' : 'Returns']}
                                />
                                <Line type="monotone" dataKey="invested" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="returns" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-5 mt-3">
                        <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500 rounded" /><span className="text-xs text-white/45">Invested</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-emerald-500 rounded" /><span className="text-xs text-white/45">Returns</span></div>
                    </div>
                </div>

                {/* Risk Distribution Doughnut */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 transition-all duration-300 hover:bg-white/7 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-xl min-w-0">
                    <h2 className="text-lg font-semibold text-white mb-1">Risk Distribution</h2>
                    <p className="text-xs text-white/45 mb-6">Current portfolio breakdown</p>
                    <div className="h-52 relative">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <PieChart>
                                <Pie
                                    data={DUMMY_RISK_DISTRIBUTION}
                                    cx="50%" cy="50%"
                                    innerRadius={52} outerRadius={78}
                                    paddingAngle={4} dataKey="value"
                                >
                                    {DUMMY_RISK_DISTRIBUTION.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    formatter={(v) => [`${v}%`]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-bold text-white">54%</span>
                            <span className="text-xs text-white/45">Low Risk</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        {DUMMY_RISK_DISTRIBUTION.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-white/70">{item.name}</span>
                                </div>
                                <span className="text-xs font-semibold text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Explore Marketplace CTA */}
            <div className="flex justify-center pt-2 pb-4">
                <button
                    onClick={onExploreMarketplace}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold flex items-center gap-2.5 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Zap size={18} />
                    Explore Marketplace
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

const MarketplaceSection = ({ onViewInvoice, onFundInvoice, availableInvoices = [] }) => {
    const [search, setSearch] = useState('');
    const [riskFilter, setRiskFilter] = useState('ALL');

    const filtered = availableInvoices.filter(inv => {
        const msmeName = inv.original?.user?.kyc?.businessName || inv.original?.user?.kyc?.legalName || inv.msmeName || 'Unknown MSME';
        const matchSearch =
            msmeName.toLowerCase().includes(search.toLowerCase()) ||
            inv.id.includes(search.toLowerCase());
        const matchRisk = riskFilter === 'ALL' || inv.riskLevel === riskFilter;
        return matchSearch && matchRisk;
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Available Invoices</h2>
                <p className="text-white/45 mt-1">Browse and fund verified MSME invoices</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={17} />
                    <input
                        type="text"
                        placeholder="Search by MSME name or Invoice ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-white/45" />
                    {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRiskFilter(r)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${riskFilter === r
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                : 'border-white/10 bg-white/5 text-white/45 hover:text-white hover:border-white/20 hover:bg-white/10'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                {['Invoice ID', 'MSME Name', 'Amount', 'Due Date', 'Credit Score', 'Risk Level', 'Exp. Return', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-semibold text-white/45 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-white/45">
                                        No invoices match your search.
                                    </td>
                                </tr>
                            ) : filtered.map((inv) => {
                                const msmeName = inv.original?.user?.kyc?.businessName || inv.original?.user?.kyc?.legalName || inv.msmeName || 'Unknown MSME';
                                const expReturn = inv.expectedReturn || (inv.riskLevel === 'HIGH' ? 18.5 : inv.riskLevel === 'MEDIUM' ? 14.0 : 9.5);
                                return (
                                    <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">#{inv.id.substring(0, 6)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{msmeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                                            ₹{Number(inv.amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                            {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-1.5 rounded-full ${inv.creditScore >= 80 ? 'bg-emerald-500' : inv.creditScore >= 55 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${inv.creditScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white/70">{inv.creditScore}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RiskBadge level={inv.riskLevel} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-emerald-400">{expReturn}%</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewInvoice(inv);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center gap-1">
                                                    <Eye size={13} /> View
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onFundInvoice(inv);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center gap-1 shadow-[0_0_10px_rgba(56,189,248,0.2)] hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all">
                                                    <Zap size={13} /> Fund
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const InvestmentsSection = ({ myDeals, onFundDeal }) => {
    const totalInvested = myDeals.reduce((sum, deal) => sum + parseFloat(deal.fundedAmount), 0);
    const expectedReturns = myDeals.reduce((sum, deal) => sum + parseFloat(deal.interestAmount), 0);
    const activePositions = myDeals.filter(d => d.status === 'ACTIVE').length;
    const settledPositions = myDeals.filter(d => d.status === 'CLOSED').length;
    const defaultedPositions = myDeals.filter(d => d.status === 'DEFAULTED').length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">My Investments</h2>
                <p className="text-white/45 mt-1">Track all your funded invoices and expected returns</p>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Invested', value: `₹${Number(totalInvested).toLocaleString('en-IN')}`, color: 'text-blue-400' },
                    { label: 'Expected Returns', value: `₹${Number(expectedReturns).toLocaleString('en-IN')}`, color: 'text-emerald-400' },
                    { label: 'Active Positions', value: activePositions.toString(), color: 'text-white' },
                    { label: 'Settled / Defaulted', value: `${settledPositions} / ${defaultedPositions}`, color: 'text-white/45' },
                ].map(item => (
                    <div key={item.label} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-4 transition-all duration-300 hover:bg-white/7 hover:border-white/20">
                        <p className="text-xs text-white/45 font-medium uppercase tracking-wider mb-1">{item.label}</p>
                        <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                {['Invoice ID', 'MSME Name', 'Invested', 'Expected Return', 'Due Date', 'Days Left', 'Action'].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-semibold text-white/45 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {myDeals.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/45">No investments found</td>
                                </tr>
                            ) : myDeals.map((deal) => {
                                const dueDate = new Date(deal.dueDate);
                                const now = new Date();
                                const diffTime = dueDate - now;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const maxDaysLeft = Math.max(0, diffDays);

                                return (
                                    <tr key={deal.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                                            {deal.invoice?.invoice_number ? `#${deal.invoice.invoice_number}` : `#${deal.invoiceId.substring(0, 6)}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{deal.msme?.name || 'Unknown MSME'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                                            ₹{Number(deal.fundedAmount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-400">
                                            ₹{Number(deal.interestAmount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                            {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {deal.status === 'ACTIVE'
                                                ? <span className="font-semibold text-white">{maxDaysLeft}d</span>
                                                : <span className="text-white/45">—</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {deal.status === 'ACTIVE' ? (
                                                <button
                                                    onClick={() => onFundDeal(deal.id)}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center gap-1 shadow-[0_0_10px_rgba(56,189,248,0.2)] hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all opacity-0 group-hover:opacity-100">
                                                    <Zap size={13} /> Fund Deal
                                                </button>
                                            ) : (
                                                <InvestmentStatusBadge status={deal.status} />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MeetingsSection = () => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Meeting Records</h2>
            <p className="text-white/45 mt-1">Zoom verification sessions with MSME partners</p>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Video size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/70">
                All meetings are recorded for compliance purposes. Recordings are available for 90 days post-session.
                <span className="text-blue-400 ml-1 cursor-pointer hover:underline">Contact support</span> for extended access.
            </p>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            {['Invoice ID', 'MSME Name', 'Meeting Date', 'Duration', 'Recording', 'Action'].map(h => (
                                <th key={h} className="px-6 py-4 text-xs font-semibold text-white/45 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {DUMMY_MEETINGS.map((m) => (
                            <tr key={m.invoiceId + m.meetingDate} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">#{m.invoiceId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{m.msmeName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                    {new Date(m.meetingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={13} className="text-white/45" />
                                        {m.duration}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <RecordingStatusBadge status={m.recordingStatus} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        disabled={m.recordingStatus !== 'AVAILABLE'}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100 ${m.recordingStatus === 'AVAILABLE'
                                            ? 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10 cursor-pointer'
                                            : 'border-white/10 text-white/30 cursor-not-allowed'
                                            }`}
                                    >
                                        <Video size={13} />
                                        {m.recordingStatus === 'AVAILABLE' ? 'View Recording' : 'Processing...'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Empty state note */}
        <p className="text-xs text-white/45 text-center">Showing {DUMMY_MEETINGS.length} meeting records. New sessions are logged automatically upon completion.</p>
    </div>
);

const AnalyticsSection = () => (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Risk Analytics</h2>
            <p className="text-white/45 mt-1">Portfolio health metrics and risk intelligence</p>
        </div>

        {/* Summary Stat Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: 'Average Credit Score', value: '76.8', sub: 'Across all funded invoices', color: '#3b82f6' },
                { label: 'Default Rate', value: '8.3%', sub: 'Historical portfolio average', color: '#ef4444' },
                { label: 'Avg. Return Rate', value: '11.2%', sub: 'Annualised across all investments', color: '#10b981' },
            ].map(stat => (
                <div key={stat.label} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 text-center transition-all duration-300 hover:bg-white/7 hover:border-white/20 hover:-translate-y-0.5">
                    <div className="text-3xl font-extrabold mb-2" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
                    <div className="text-xs text-white/45">{stat.sub}</div>
                </div>
            ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Default Probability Bar Chart */}
            <div className="lg:col-span-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 transition-all duration-300 hover:bg-white/7 hover:border-white/20 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1">Default Probability by Risk Tier</h3>
                <p className="text-xs text-white/45 mb-6">Historical default rates per risk classification</p>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <BarChart data={DUMMY_DEFAULT_PROB} barSize={48}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis dataKey="tier" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                formatter={(v) => [`${v}%`, 'Default Probability']}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                                {DUMMY_DEFAULT_PROB.map((entry, i) => (
                                    <Cell key={i} fill={i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Portfolio Allocation Pie - NOW SECTOR WISE */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 transition-all duration-300 hover:bg-white/7 hover:border-white/20 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1">Sector Allocation</h3>
                <p className="text-xs text-white/45 mb-6">Investment distribution by industry</p>
                <div className="h-56 relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <PieChart>
                            <Pie
                                data={DUMMY_SECTOR_DATA}
                                cx="50%" cy="50%"
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {DUMMY_SECTOR_DATA.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                formatter={(v) => [`${v}%`]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {DUMMY_SECTOR_DATA.map(item => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-white/70">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* ROI Benchmark Chart */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 transition-all duration-300 hover:bg-white/7 hover:border-white/20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">ROI vs Market Benchmark</h3>
                    <p className="text-xs text-white/45 mt-0.5">Your portfolio performance vs standard FD rates</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500 rounded" /><span className="text-xs text-white/70">My Portfolio</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-white/30 rounded" /><span className="text-xs text-white/70">Market Benchmark</span></div>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <LineChart data={DUMMY_ROI_BENCHMARK}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(v) => [`${v}%`]}
                        />
                        <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Risk Guidance */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { level: 'LOW', desc: 'Credit Score ≥ 80. Businesses with 5+ years history. Minimal default risk. Returns 7–10%.', color: 'border-emerald-500/30 bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-400' },
                    { level: 'MEDIUM', desc: 'Credit Score 55–79. Moderate business age. Balanced risk-return. Returns 10–16%.', color: 'border-amber-500/30 bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-400' },
                    { level: 'HIGH', desc: 'Credit Score < 55. Young businesses or fraud-flagged. High default risk. Returns 17–25%.', color: 'border-rose-500/30 bg-rose-500/5', badge: 'bg-rose-500/10 text-rose-400' },
                ].map(g => (
                    <div key={g.level} className={`rounded-xl border p-4 ${g.color}`}>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${g.badge}`}>{g.level} RISK</span>
                        <p className="text-xs text-white/70 leading-relaxed">{g.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const LenderDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [availableInvoices, setAvailableInvoices] = useState([]);
    const [wallet, setWallet] = useState({ availableBalance: 0, lockedBalance: 0, totalEarnings: 0 });
    const [myDeals, setMyDeals] = useState([]);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [offerForm, setOfferForm] = useState({ amount: '', rate: '' });
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

    const kycStatus = user?.kycStatus || 'NOT_SUBMITTED';
    const isKycVerified = kycStatus === 'VERIFIED';

    // Loading skeleton — identical to MSMEDashboard pattern
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Simulate short init delay for skeleton (matches MSME)
        const t = setTimeout(() => {
            setLoading(false);
            setTimeout(() => setVisible(true), 20);
        }, 1500);
        return () => clearTimeout(t);
    }, []);

    // KYC toast on first render — identical to MSME pattern
    useEffect(() => {
        if (kycStatus !== 'VERIFIED' && kycStatus !== 'NOT_SUBMITTED') {
            const toastId = 'kyc-status-toast';
            if (kycStatus === 'IN_PROGRESS') {
                toast(`🔍 Your KYC is under review. We'll notify you once verified.`, {
                    id: toastId,
                    duration: 5000,
                    style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(59,130,246,0.3)' },
                });
            } else if (kycStatus === 'REJECTED') {
                toast.error('❌ Your KYC was rejected. Please resubmit to access the marketplace.', {
                    id: toastId,
                    duration: 6000,
                });
            }
        }
    }, [kycStatus]);

    useEffect(() => {
        const fetchMarketplace = async () => {
            if (isKycVerified) {
                try {
                    const invoices = await getAvailableInvoices();
                    setAvailableInvoices(invoices);
                } catch (error) {
                    toast.error('Failed to load available invoices');
                    console.error(error);
                }
            }
        };

        const fetchDashboardData = async () => {
            if (isKycVerified) {
                try {
                    const [walletData, dealsData] = await Promise.all([
                        getMyWallet(),
                        getMyDeals()
                    ]);
                    setWallet(walletData);
                    setMyDeals(dealsData);
                } catch (error) {
                    console.error("Failed to fetch dashboard data", error);
                }
            }
        };

        fetchMarketplace();
        fetchDashboardData();
    }, [isKycVerified]);

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        const amount = parseFloat(offerForm.amount);
        const rate = parseFloat(offerForm.rate);

        if (amount <= 0 || amount > selectedInvoice.amount) {
            toast.error('Invalid offer amount');
            return;
        }

        if (rate <= 0 || rate > 36) {
            toast.error('Invalid interest rate');
            return;
        }

        if (amount > wallet.availableBalance) {
            toast.error('Offer amount exceeds available wallet balance');
            return;
        }

        try {
            setIsSubmittingOffer(true);
            await createOffer({
                invoiceId: selectedInvoice.id,
                fundedAmount: amount,
                interestRate: rate
            });
            toast.success('Funding offer sent successfully!');
            setIsOfferModalOpen(false);
            setOfferForm({ amount: '', rate: '' });
            setSelectedInvoice(null);
        } catch (error) {
            toast.error(error.message || 'Failed to send offer');
        } finally {
            setIsSubmittingOffer(false);
        }
    };

    const handleFundDeal = async (dealId) => {
        try {
            await fundDeal(dealId);
            toast.success('Deal funded successfully!');
            // Refresh data
            const [walletData, dealsData] = await Promise.all([
                getMyWallet(),
                getMyDeals()
            ]);
            setWallet(walletData);
            setMyDeals(dealsData);
        } catch (error) {
            toast.error(error.message || 'Failed to fund deal');
        }
    };

    // ── Marketplace KYC Gate Banner ───────────────────────────────────────────
    const MarketplaceKycBanner = () => (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <LockKeyhole size={36} className="text-amber-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Marketplace Access Restricted</h2>
                <p className="text-muted max-w-md">
                    {kycStatus === 'IN_PROGRESS'
                        ? 'Your KYC is currently under review. Marketplace access will be unlocked once verified by our team.'
                        : kycStatus === 'REJECTED'
                            ? 'Your KYC was rejected. Please resubmit your details to regain marketplace access.'
                            : 'Please complete your KYC verification to access the invoice marketplace.'}
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                    onClick={() => navigate('/lender/kyc')}
                    className="btn-primary px-6 py-2.5 flex items-center gap-2"
                >
                    <ShieldCheck size={16} />
                    {kycStatus === 'REJECTED' ? 'Resubmit KYC' : kycStatus === 'IN_PROGRESS' ? 'View KYC Status' : 'Complete KYC'}
                </button>
                {kycStatus === 'IN_PROGRESS' && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-xs text-blue-400 font-medium">Verification in progress</span>
                    </div>
                )}
            </div>
        </div>
    );

    const renderSection = () => {
        switch (activeTab) {
            case 'overview': return <OverviewSection onExploreMarketplace={() => setActiveTab('marketplace')} wallet={wallet} myDeals={myDeals} />;
            case 'marketplace': return isKycVerified
                ? <MarketplaceSection
                    onViewInvoice={(inv) => {
                        setSelectedInvoice(inv);
                    }}
                    onFundInvoice={(inv) => {
                        setSelectedInvoice(inv);
                        setIsOfferModalOpen(true);
                    }}
                    availableInvoices={availableInvoices} />
                : <MarketplaceKycBanner />;
            case 'investments': return <InvestmentsSection myDeals={myDeals} onFundDeal={handleFundDeal} />;
            case 'meetings': return <MeetingsSection />;
            case 'analytics': return <AnalyticsSection />;
            default: return <OverviewSection wallet={wallet} myDeals={myDeals} />;
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950">
            {/* Glow blobs — same as MSMEDashboard */}
            <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-24 w-[400px] h-[400px] bg-cyan-500 rounded-full -z-10 blur-3xl opacity-[0.08] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 -z-10 pointer-events-none" />

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Skeleton loader — same as MSMEDashboard */}
                {loading && <FinbridgeLoading userName={user?.name} />}

                <div
                    className="space-y-6 pb-20"
                    style={{
                        opacity: (loading || !visible) ? 0 : 1,
                        transition: 'opacity 0.5s ease',
                        display: loading ? 'none' : undefined,
                    }}
                >
                    {/* Invoice Detail Panel Overlay */}
                    {selectedInvoice && !isOfferModalOpen && (
                        <InvoiceDetailPanel
                            invoice={selectedInvoice}
                            onClose={() => setSelectedInvoice(null)}
                            onFundInvoice={(inv) => {
                                setIsOfferModalOpen(true);
                            }}
                        />
                    )}
                    {/* Offer Modal */}
                    {isOfferModalOpen && selectedInvoice && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOfferModalOpen(false)}></div>
                            <div className="relative bg-[#0F172A] border border-cardBorder rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Make Funding Offer</h3>
                                    <button onClick={() => setIsOfferModalOpen(false)} className="text-muted hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mb-6 p-4 rounded-xl bg-bg0/50 border border-cardBorder">
                                    <p className="text-xs text-muted mb-1">Invoice #{selectedInvoice.id.substring(0, 6)}</p>
                                    <p className="text-lg font-semibold text-white">₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-muted mt-2 flex justify-between">
                                        <span>Wallet Available:</span>
                                        <span className="text-accent font-medium">₹{Number(wallet.availableBalance).toLocaleString('en-IN')}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleCreateOffer} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1.5">Offer Amount (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1000"
                                            max={selectedInvoice.amount}
                                            value={offerForm.amount}
                                            onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })}
                                            className="form-input w-full bg-bg0/50 text-white placeholder-muted/50 border-cardBorder focus:border-accent"
                                            placeholder="Enter amount to fund..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1.5">Interest Rate (% p.a.)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            min="1"
                                            max="36"
                                            value={offerForm.rate}
                                            onChange={(e) => setOfferForm({ ...offerForm, rate: e.target.value })}
                                            className="form-input w-full bg-bg0/50 text-white placeholder-muted/50 border-cardBorder focus:border-accent"
                                            placeholder="E.g. 12.5"
                                        />
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <button
                                            type="submit"
                                            disabled={isSubmittingOffer}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all"
                                        >
                                            {isSubmittingOffer ? (
                                                <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</>
                                            ) : (
                                                <><Zap size={18} /> Send Offer</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Page Header — same pattern as MSMEDashboard */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-4">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Lender Dashboard
                            </div>
                            <h1 className="text-4xl font-semibold text-white tracking-tight">
                                Welcome back,{' '}
                                <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">{user?.name || 'Test Lender'}</span>
                            </h1>
                            <p className="text-white/60 mt-2 text-sm">Here's what's happening with your investments today.</p>
                        </div>

                        {/* KYC CTA — amber pulsing button identical to MSME */}
                        {!isKycVerified ? (
                            <div className="shrink-0 flex flex-col items-end gap-2 text-right">
                                <button
                                    onClick={() => navigate('/lender/kyc')}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm animate-pulse"
                                >
                                    <Briefcase size={16} />
                                    Complete KYC to Unlock Marketplace
                                </button>
                                <span className="text-amber-400/80 text-xs font-medium bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                    Current Status: {kycStatus?.replace('_', ' ') || 'NOT SUBMITTED'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
                                <ShieldCheck size={14} />
                                KYC Verified
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-white/10 pb-2">
                        <div className="flex gap-2 overflow-x-auto">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap relative ${isActive
                                            ? 'text-white bg-white/10 border border-white/10'
                                            : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <Icon size={15} />
                                        {tab.label}
                                        {isActive && (
                                            <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-blue-400 rounded-t-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Section */}
                    {renderSection()}
                </div>
            </div>
        </div>
    );
};

export default LenderDashboard;
