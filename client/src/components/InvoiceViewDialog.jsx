import React from 'react';
import { X, Download } from 'lucide-react';

export default function InvoiceViewDialog({ invoice, onClose, onFund, showFundButton = false }) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-3xl bg-theme-bg overflow-hidden border border-theme-border rounded-2xl shadow-2xl shadow-black/30 flex flex-col animate-in fade-in zoom-in-95">

        {/* Header */}
        <header className="flex items-start justify-between p-6 border-b border-theme-border/50 bg-theme-surface/30">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">#{invoice.id.toString().slice(-6)}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${invoice.status === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>{invoice.status}</span>
            </div>
            <h2 className="text-2xl font-bold text-theme-text leading-tight tracking-tight">Invoice Details</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 -mt-2 rounded-xl hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text transition-colors">
            <X size={20} />
          </button>
        </header>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

            {/* Left Column: Invoice Summary */}
            <section className="bg-theme-surface/40 rounded-2xl border border-theme-border/50 p-6 flex flex-col gap-5">
              <h3 className="text-sm font-semibold text-theme-text mb-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Invoice Summary
              </h3>

              <div>
                <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">MSME Name</span>
                <div className="text-theme-text font-semibold text-base mt-1">{invoice.msmeName || 'N/A'}</div>
              </div>

              <div>
                <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">Buyer GSTIN</span>
                <div className="text-theme-text font-semibold text-base font-mono mt-1">{invoice.buyerGstin || 'N/A'}</div>
              </div>

              <div>
                <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">System Status</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md border ${invoice.status === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>{invoice.status}</span>
                </div>
              </div>
            </section>

            {/* Right Column: Risk Snapshot */}
            <section className="bg-theme-surface/40 rounded-2xl border border-theme-border/50 p-6 flex flex-col gap-5">
              <h3 className="text-sm font-semibold text-theme-text mb-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Risk Snapshot
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">Amount</span>
                  <div className="text-theme-text font-bold text-lg mt-1 tracking-tight">₹{Number(invoice.amount).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">Due Date</span>
                  <div className="text-theme-text font-semibold text-base mt-1">{new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-theme-border/50">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">Credit Score</span>
                  <span className="text-xs font-bold text-theme-text">{invoice.creditScore} <span className="text-theme-text-muted font-normal">/ 100</span></span>
                </div>
                <div className="w-full h-2.5 bg-theme-surface-hover rounded-full overflow-hidden border border-theme-border/50">
                  <div className={`h-full rounded-full transition-all duration-1000 ${invoice.creditScore >= 80 ? 'bg-emerald-500' : invoice.creditScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${invoice.creditScore}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium block mb-1.5">Risk Level</span>
                  <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md capitalize border ${invoice.riskLevel === 'low' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : invoice.riskLevel === 'medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'}`}>{(invoice.riskLevel || 'N/A').toLowerCase()} Risk</span>
                </div>

                {showFundButton && (
                  <div className="text-right">
                    <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium block mb-1.5">Expected Return</span>
                    <div className="text-theme-text font-bold text-base text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md inline-block border border-emerald-500/20">{invoice.expectedReturn ? `${invoice.expectedReturn}%` : 'N/A'}</div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between p-6 border-t border-theme-border/50 bg-theme-surface/30">
          <button
            className="py-2.5 px-5 rounded-xl bg-theme-surface-hover border border-theme-border text-theme-text-muted hover:bg-theme-surface hover:text-theme-text transition-all flex items-center gap-2 shadow-sm font-medium text-sm"
            onClick={() => {/* TODO: Download PDF logic */ }}
          >
            <Download size={16} /> Download PDF
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-theme-surface-hover border border-theme-border text-theme-text hover:bg-theme-surface-hover/80 transition-all font-medium text-sm"
            >
              Close
            </button>
            {showFundButton && (
              <button
                onClick={onFund}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all border border-blue-500/50 text-sm"
              >
                Fund this Invoice
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
