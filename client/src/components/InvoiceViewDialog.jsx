import React from 'react';
import { X, Download } from 'lucide-react';

export default function InvoiceViewDialog({ invoice, onClose, onFund }) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-theme-border rounded-2xl shadow-2xl flex flex-col divide-y divide-theme-border animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">#{invoice.id.toString().slice(-6)}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${invoice.status === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'}`}>{invoice.status}</span>
            </div>
            <h2 className="text-2xl font-bold text-theme-text leading-tight">Invoice Details</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-theme-surface-hover text-white/45 hover:text-theme-text transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: MSME/Buyer info */}
          <div className="space-y-4">
            <div>
              <span className="text-xs text-theme-text-muted uppercase tracking-wider">MSME Name</span>
              <div className="text-theme-text font-semibold text-lg mt-1">{invoice.msmeName || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-theme-text-muted uppercase tracking-wider">Buyer GSTIN</span>
              <div className="text-theme-text font-semibold mt-1">{invoice.buyerGstin || 'N/A'}</div>
            </div>
          </div>

          {/* Right: Amount, Due Date, Credit Score, Risk, Return */}
          <div className="space-y-4">
            <div>
              <span className="text-xs text-theme-text-muted uppercase tracking-wider">Amount</span>
              <div className="text-theme-text font-semibold text-lg mt-1">₹{Number(invoice.amount).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-xs text-theme-text-muted uppercase tracking-wider">Due Date</span>
              <div className="text-theme-text font-semibold mt-1">{new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-xs text-theme-text-muted uppercase tracking-wider">Credit Score</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 h-2 bg-theme-surface-hover rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${invoice.creditScore >= 80 ? 'bg-emerald-400' : invoice.creditScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${invoice.creditScore}%` }} />
                </div>
                <span className="text-xs text-theme-text-muted tabular-nums">{invoice.creditScore}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-theme-text-muted uppercase tracking-wider">Risk</span>
              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full capitalize mt-1 ${invoice.riskLevel === 'low' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : invoice.riskLevel === 'medium' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>{(invoice.riskLevel || 'N/A').toLowerCase()}</span>
            </div>
            <div>
              <span className="text-xs text-theme-text-muted uppercase tracking-wider">Expected Return</span>
              <div className="text-theme-text font-semibold mt-1">{invoice.expectedReturn ? `${invoice.expectedReturn}%` : 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 gap-4">
          <button
            onClick={onFund}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-theme-text font-semibold flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all"
          >
            Fund this Invoice
          </button>
          <button
            className="py-3 px-4 rounded-xl bg-theme-surface-hover border border-theme-border text-white/70 hover:bg-theme-surface-hover hover:text-theme-text transition-colors flex items-center gap-2"
            onClick={() => {/* TODO: Download PDF logic */}}
          >
            <Download size={18} /> Download PDF
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-theme-surface-hover border border-theme-border text-white/70 hover:bg-theme-surface-hover hover:text-theme-text transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
