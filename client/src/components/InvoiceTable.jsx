import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import { ShieldAlert, Plus, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import InvoiceViewDialog from './InvoiceViewDialog';

const riskPill = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'low' || l === 'safe') return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20';
    if (l === 'medium') return 'bg-amber-500/15 text-amber-300 border border-amber-500/20';
    if (l === 'high' || l === 'critical risk') return 'bg-rose-500/15 text-rose-300 border border-rose-500/20';
    return 'bg-theme-surface-hover text-theme-text-muted border border-theme-border';
};

const statusPill = (status) => {
    if (status === 'VERIFIED') return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20';
    if (status === 'PENDING') return 'bg-amber-500/15 text-amber-300 border border-amber-500/20';
    if (status === 'REJECTED') return 'bg-rose-500/15 text-rose-300 border border-rose-500/20';
    return 'bg-theme-surface-hover text-theme-text-muted border border-theme-border';
};

const InvoiceTable = ({ invoices, onCreate, showFundButton = false }) => {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedInvoiceForFund, setSelectedInvoiceForFund] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFundOpen, setIsFundOpen] = useState(false);
    if (!invoices || invoices.length === 0) {
        return (
            <div className="rounded-2xl border border-theme-border bg-theme-surface-hover backdrop-blur-xl p-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-theme-surface-hover border border-theme-border flex items-center justify-center mb-4">
                    <ShieldAlert className="text-white/30" size={22} />
                </div>
                <h3 className="text-base font-medium text-theme-text mb-1">No invoices found</h3>
                <p className="text-theme-text-muted text-sm mb-6">Get started by creating your first invoice.</p>
                {onCreate && (
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-theme-text font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
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
            <div className="rounded-2xl border border-theme-border bg-theme-surface-hover backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="border-b border-theme-border bg-theme-surface-hover">
                                <th className="px-6 py-4 text-xs font-semibold text-theme-text-muted uppercase tracking-widest">Invoice ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-theme-text-muted uppercase tracking-widest">Buyer GSTIN</th>
                                <th className="px-6 py-4 text-xs font-semibold text-theme-text-muted uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-theme-text-muted uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-theme-text-muted uppercase tracking-widest">Credit Score</th>
                                <th className="px-6 py-4 text-xs font-semibold text-theme-text-muted uppercase tracking-widest">Risk</th>
                                <th className="px-6 py-4 text-xs font-semibold text-theme-text-muted uppercase tracking-widest">Status</th>
                                {showFundButton && (
                                    <th className="px-6 py-4 text-xs font-semibold text-theme-text-muted uppercase tracking-widest text-right">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-theme-surface-hover transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-medium text-theme-text">#{invoice.id.toString().slice(-6)}</span>
                                    </td>
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
                                            <div className="w-14 bg-theme-surface-hover rounded-full h-1 overflow-hidden">
                                                <div
                                                    className={`h-1 rounded-full ${invoice.creditScore >= 80 ? 'bg-emerald-400' :
                                                        invoice.creditScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                                                        }`}
                                                    style={{ width: `${invoice.creditScore}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-theme-text-muted tabular-nums">{invoice.creditScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full capitalize ${riskPill(invoice.riskLevel)}`}>
                                            {(invoice.riskLevel || 'N/A').toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusPill(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    {showFundButton && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedInvoice(invoice);
                                                        setIsViewOpen(true);
                                                    }}
                                                    className="h-9 px-3 rounded-lg text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-theme-surface-hover hover:border-theme-border transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedInvoiceForFund(invoice);
                                                        setIsFundOpen(true);
                                                    }}
                                                    className="h-9 px-3 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-theme-surface-hover hover:border-theme-border transition-colors"
                                                >
                                                    Fund
                                                </button>
                                            </div>
                                        </td>
                                    )}
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
                    onFund={() => {
                        setIsViewOpen(false);
                        setSelectedInvoice(null);
                        setSelectedInvoiceForFund(selectedInvoice);
                        setIsFundOpen(true);
                    }}
                />
            )}

            {/* Fund Invoice Modal */}
            {/* {isFundOpen && selectedInvoiceForFund && (
                <FundInvoiceDialog
                    invoice={selectedInvoiceForFund}
                    onClose={() => {
                        setIsFundOpen(false);
                        setSelectedInvoiceForFund(null);
                    }}
                />
            )} */}
        </>
    );
};

export default InvoiceTable;
