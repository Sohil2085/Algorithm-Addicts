import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';
import { getInvoices } from '../api/invoiceApi';
import InvoiceTable from '../components/InvoiceTable';
import InvoicesLoading from '../components/InvoicesLoading';
import toast from 'react-hot-toast';

// ── Page ──────────────────────────────────────────────────────────────────────
const InvoiceList = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fadingOut, setFadingOut] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('ALL');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setFadingOut(false);
            const data = await getInvoices();
            setInvoices(data);
            setFadingOut(true);
            setTimeout(() => setLoading(false), 520);
        } catch (error) {
            toast.error('Could not load invoices');
            console.error(error);
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchSearch = invoice.buyerGstin?.toLowerCase().includes(searchTerm.toLowerCase()) || invoice.id?.toString().includes(searchTerm);

        const rawRisk = (invoice.riskLevel || '').toUpperCase().replace(' RISK', '').trim();
        const matchRisk = riskFilter === 'ALL' || rawRisk === riskFilter;

        return matchSearch && matchRisk;
    });

    return (
        <div className="min-h-screen relative overflow-hidden bg-theme-bg">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.10] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                {/* ── Header ─ always visible ──────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                    <div>
                        <h1 className="text-4xl font-semibold text-theme-text tracking-tight">Invoices</h1>
                        <p className="text-theme-text-muted mt-1 text-sm">Manage and track your invoice submissions</p>
                    </div>
                    <button
                        disabled={loading}
                        onClick={() => navigate('/upload-invoice')}
                        className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-theme-text font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                        <Plus size={15} />
                        <span>Create Invoice</span>
                    </button>
                </div>

                {/* ── Toolbar ─ always visible ─────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" size={15} />
                        <input
                            type="text"
                            placeholder="Search by ID or Buyer GSTIN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={loading}
                            className="w-full bg-theme-surface-hover border border-theme-border rounded-xl pl-9 pr-4 py-2.5 text-theme-text text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-theme-border bg-theme-surface-hover text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-active transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                        >
                            <Filter size={15} />
                            <span>{riskFilter === 'ALL' ? 'Filter' : `${riskFilter} RISK`}</span>
                        </button>

                        {showFilterDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-theme-bg border border-theme-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                                {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'VERY HIGH', 'CRITICAL'].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => { setRiskFilter(r); setShowFilterDropdown(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${riskFilter === r ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-theme-text-muted hover:bg-theme-surface-hover hover:text-theme-text'}`}
                                    >
                                        {r === 'ALL' ? 'All Risks' : `${r} Risk`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Table area ─ swap skeleton vs real ──────────────────── */}
                {loading ? (
                    <InvoicesLoading isExiting={fadingOut} />
                ) : (
                    <div className="animate-fade-up min-h-[420px]">
                        <InvoiceTable invoices={filteredInvoices} onCreate={() => navigate('/upload-invoice')} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default InvoiceList;

