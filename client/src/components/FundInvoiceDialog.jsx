import React, { useState } from "react";
import {
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createOffer } from "../api/offerApi";

export default function FundInvoiceDialog({ invoice, onClose }) {
  const [fundedAmount, setFundedAmount] = useState(
    Number(invoice.amount).toFixed(2),
  );
  const [interestRate, setInterestRate] = useState("12");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const invoiceAmount = Number(invoice.amount);
  const funded = parseFloat(fundedAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const interestAmount = ((funded * rate) / 100).toFixed(2);
  const platformFee = (invoiceAmount * 0.01).toFixed(2);
  const totalReturn = (funded + parseFloat(interestAmount)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (funded <= 0 || funded > invoiceAmount) {
      setError(
        `Funded amount must be between ₹1 and ₹${invoiceAmount.toLocaleString()}`,
      );
      return;
    }
    if (rate <= 0 || rate > 100) {
      setError("Interest rate must be between 0.01% and 100%");
      return;
    }
    setLoading(true);
    try {
      await createOffer({
        invoiceId: invoice.id,
        fundedAmount: funded,
        interestRate: rate,
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Failed to submit offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col divide-y divide-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                #{invoice.id?.toString().slice(-6)}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                {invoice.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">Fund this Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/45 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {success ? (
          /* ─── Success state ─── */
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-400" size={28} />
            </div>
            <p className="text-white font-semibold text-lg">Offer Submitted!</p>
            <p className="text-white/50 text-sm">
              Your funding offer of ₹{Number(fundedAmount).toLocaleString()} at{" "}
              {interestRate}% has been sent to the MSME for review.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* ─── Form ─── */
          <form onSubmit={handleSubmit}>
            {/* Invoice summary */}
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-white/40 uppercase tracking-wider">
                  Invoice Amount
                </span>
                <div className="text-white font-bold text-lg mt-0.5">
                  ₹{invoiceAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-xs text-white/40 uppercase tracking-wider">
                  Buyer GSTIN
                </span>
                <div className="text-white/80 font-medium mt-0.5 text-sm truncate">
                  {invoice.buyer_gstin || invoice.buyerGstin || "—"}
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="px-6 pb-4 space-y-4">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
                  Funded Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={invoiceAmount}
                  step="0.01"
                  value={fundedAmount}
                  onChange={(e) => setFundedAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
                  Annual Interest Rate (%)
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="mx-6 mb-4 rounded-xl bg-white/5 border border-white/10 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Interest Earned</span>
                <span className="text-emerald-400 font-medium">
                  +₹{Number(interestAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Platform Fee (1%)</span>
                <span className="text-rose-400 font-medium">
                  -₹{Number(platformFee).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-white font-semibold border-t border-white/10 pt-2 mt-2">
                <span>Total Return</span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-sky-400" />₹
                  {Number(totalReturn).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-6 mb-4 flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-300 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="p-6 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : null}
                {loading ? "Submitting…" : "Submit Offer"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
