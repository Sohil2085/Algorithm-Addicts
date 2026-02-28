import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import { ShieldAlert, Plus, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InvoiceViewDialog from './InvoiceViewDialog';

const riskPill = (level) => {
    const l = (level || '').toLowerCase().replace(' risk', '').trim();
    if (l === 'low' || l === 'safe') return 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 border border-emerald-500/20';
    if (l === 'medium') return 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/20';
    if (l === 'high') return 'bg-red-400/10 text-red-500 dark:text-red-400 border border-red-400/20';
    if (l === 'very high' || l === 'critical') return 'bg-red-600/15 text-red-600 dark:text-red-500 border border-red-600/20';
    return 'bg-theme-surface-hover text-theme-text-muted border border-theme-border';
};

const statusPill = (status) => {
    if (status === 'VERIFIED') return 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 border border-emerald-500/20';
    if (status === 'PENDING') return 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/20';
    if (status === 'REJECTED') return 'bg-rose-500/15 text-rose-500 dark:text-rose-300 border border-rose-500/20';
    return 'bg-theme-surface-hover text-theme-text-muted border border-theme-border';
};

const InvoiceTable = ({ invoices, onCreate, showFundButton = false }) => {
    const { user } = useAuth();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedInvoiceForFund, setSelectedInvoiceForFund] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFundOpen, setIsFundOpen] = useState(false);

    const isLender = user?.role === 'LENDER';

    if (!invoices || invoices.length === 0) {
        return (
            <div className="rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-xl p-12 text-center shadow-lg shadow-theme-border/10">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-theme-surface-hover border border-theme-border flex items-center justify-center mb-4">
                    <ShieldAlert className="text-theme-text-muted" size={22} />
                </div>
                <h3 className="text-base font-medium text-theme-text mb-1">No invoices found</h3>
                <p className="text-theme-text-muted text-sm mb-6">Get started by creating your first invoice.</p>
                {onCreate && (
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={15} />
                        Create Invoice
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-xl overflow-hidden shadow-lg shadow-theme-border/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="border-b border-theme-border bg-theme-surface-hover text-theme-text-muted">
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest">Invoice ID</th>
                                {showFundButton && <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest">MSME Name</th>}
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest">Buyer GSTIN</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest">Credit Score</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest">Risk</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-theme-surface-hover transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-medium text-theme-text">#{invoice.id.toString().slice(-6)}</span>
                                    </td>
                                    {showFundButton && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-theme-text-muted">{invoice.original?.user?.kyc?.businessName || invoice.original?.user?.kyc?.legalName || invoice.msmeName || invoice.user?.kyc?.businessName || invoice.user?.kyc?.legalName || 'N/A'}</span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-theme-text-muted font-mono">{invoice.buyerGstin}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-theme-text">₹{Number(invoice.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-theme-text-muted">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-14 bg-theme-border rounded-full h-1 overflow-hidden">
                                                <div
                                                    className={`h-1 rounded-full ${invoice.creditScore >= 80 ? 'bg-emerald-500' :
                                                        invoice.creditScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`}
                                                    style={{ width: `${invoice.creditScore}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-theme-text-muted tabular-nums font-medium">{invoice.creditScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full capitalize ${riskPill(invoice.riskLevel)}`}>
                                            {(invoice.riskLevel || 'N/A').toLowerCase().includes('risk')
                                                ? (invoice.riskLevel || 'N/A').toLowerCase()
                                                : `${(invoice.riskLevel || 'N/A').toLowerCase()} risk`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusPill(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedInvoice(invoice);
                                                    setIsViewOpen(true);
                                                }}
                                                className="h-9 px-3 rounded-lg text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-white/10 hover:border-white/20 transition-colors"
                                            >
                                                View
                                            </button>
                                            {isLender && (
                                                <button
                                                    disabled={user?.kycStatus !== 'VERIFIED'}
                                                    title={user?.kycStatus !== 'VERIFIED' ? 'Complete verification to fund invoices' : ''}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (user?.kycStatus !== 'VERIFIED') return;
                                                        setSelectedInvoiceForFund(invoice);
                                                        setIsFundOpen(true);
                                                    }}
                                                    className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors ${user?.kycStatus === 'VERIFIED'
                                                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-white/10 hover:border-white/20 cursor-pointer'
                                                            : 'text-emerald-400/50 bg-emerald-500/5 border border-emerald-500/10 cursor-not-allowed opacity-60'
                                                        }`}
                                                >
                                                    Fund
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Invoice Modal */}
            {isViewOpen && selectedInvoice && (
                <InvoiceViewDialog
                    invoice={selectedInvoice}
                    onClose={() => {
                        setIsViewOpen(false);
                        setSelectedInvoice(null);
                    }}
                    onFund={showFundButton ? () => {
                        setIsViewOpen(false);
                        setSelectedInvoice(null);
                        setSelectedInvoiceForFund(selectedInvoice);
                        setIsFundOpen(true);
                    } : undefined}
                    showFundButton={showFundButton}
                />
            )}
        </>
    );
};

export default InvoiceTable;
