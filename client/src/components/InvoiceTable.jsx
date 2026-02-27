import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import { ShieldAlert, Plus, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

const riskPill = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'low' || l === 'safe') return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20';
    if (l === 'medium') return 'bg-amber-500/15 text-amber-300 border border-amber-500/20';
    if (l === 'high' || l === 'critical risk') return 'bg-rose-500/15 text-rose-300 border border-rose-500/20';
    return 'bg-white/10 text-white/50 border border-white/10';
};

const statusPill = (status) => {
    if (status === 'VERIFIED') return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20';
    if (status === 'PENDING') return 'bg-amber-500/15 text-amber-300 border border-amber-500/20';
    if (status === 'REJECTED') return 'bg-rose-500/15 text-rose-300 border border-rose-500/20';
    return 'bg-white/10 text-white/50 border border-white/10';
};

const InvoiceTable = ({ invoices, onCreate }) => {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    if (!invoices || invoices.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <ShieldAlert className="text-white/30" size={22} />
                </div>
                <h3 className="text-base font-medium text-white mb-1">No invoices found</h3>
                <p className="text-white/40 text-sm mb-6">Get started by creating your first invoice.</p>
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
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">Invoice ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">Buyer GSTIN</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">Credit Score</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">Risk</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-medium text-white/80">#{invoice.id.toString().slice(-6)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-white/60 font-mono">{invoice.buyerGstin}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-white">₹{Number(invoice.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-white/50">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-14 bg-white/10 rounded-full h-1 overflow-hidden">
                                                <div
                                                    className={`h-1 rounded-full ${invoice.creditScore >= 80 ? 'bg-emerald-400' :
                                                        invoice.creditScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                                                        }`}
                                                    style={{ width: `${invoice.creditScore}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-white/40 tabular-nums">{invoice.creditScore}</span>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => setSelectedInvoice(invoice)}
                                            className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Risk Breakdown Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setSelectedInvoice(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Risk Analysis Breakdown</h2>
                                <p className="text-sm text-white/50 mt-1">Invoice #{selectedInvoice.id.toString().slice(-6)} • ₹{Number(selectedInvoice.amount).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Top Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl text-center">
                                    <p className="text-xs text-white/40 mb-1">Base Credit</p>
                                    <p className="text-2xl font-semibold text-white">{selectedInvoice.baseCreditScore || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl text-center">
                                    <p className="text-xs text-white/40 mb-1">Fraud Score</p>
                                    <p className="text-2xl font-semibold text-white">{selectedInvoice.fraudScore || 0}</p>
                                </div>
                                <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl text-center">
                                    <p className="text-xs text-white/40 mb-1">Probability</p>
                                    <p className="text-2xl font-semibold text-blue-400">{((selectedInvoice.fraudProbability || 0) * 100).toFixed(0)}%</p>
                                </div>
                                <div className="bg-slate-800 border-t border-blue-500/30 p-4 rounded-xl text-center shadow-[0_-4px_24px_-12px_rgba(59,130,246,0.5)]">
                                    <p className="text-xs text-cyan-200/60 mb-1">Final Risk</p>
                                    <p className="text-2xl font-bold tracking-tight text-white">{selectedInvoice.creditScore || 0}</p>
                                </div>
                            </div>

                            {selectedInvoice.breakdown ? (
                                <div className="space-y-6">
                                    {/* Credit Details */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 size={16} className="text-emerald-400" />
                                            <h3 className="text-sm font-semibold text-white">Credit Strength (+ Points)</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(selectedInvoice.breakdown.credit || {}).map(([rule, data]) => (
                                                <div key={rule} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 border border-white/5 p-3 rounded-xl gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-white/80 capitalize">{rule.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                        <p className="text-xs text-white/40 mt-0.5">{data.reason}</p>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                                                            +{data.score} pts
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fraud Details */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle size={16} className="text-rose-400" />
                                            <h3 className="text-sm font-semibold text-white">Fraud Suspicion (Risk Factors)</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(selectedInvoice.breakdown.fraud || {}).map(([rule, data]) => {
                                                if (data.score === 0) return null; // Only show flagged logic
                                                return (
                                                    <div key={rule} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 border border-white/5 p-3 rounded-xl gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium text-white/80 capitalize">{rule.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                            <p className="text-xs text-white/40 mt-0.5">{data.reason}</p>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <span className="text-xs font-semibold text-rose-400 bg-rose-400/10 px-2 py-1 rounded border border-rose-400/20">
                                                                Risky (+{data.score} pts)
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {Object.values(selectedInvoice.breakdown.fraud || {}).every(v => v.score === 0) && (
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400 text-sm">
                                                    No suspicious fraud signals detected!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-white/40 text-sm bg-white/5 rounded-xl border border-white/5 grid place-items-center">
                                    <ShieldAlert className="mb-2 opacity-50" />
                                    No detailed breakdown available for this legacy invoice.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InvoiceTable;
