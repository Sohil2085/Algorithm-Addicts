import React, { useState } from "react";
import RiskBadge from "./RiskBadge";
import {
  ShieldAlert,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import FundInvoiceDialog from "./FundInvoiceDialog";

const riskPill = (level) => {
  const l = (level || "").toLowerCase();
  if (l === "low" || l === "safe")
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20";
  if (l === "medium")
    return "bg-amber-500/15 text-amber-300 border border-amber-500/20";
  if (l === "high" || l === "critical risk")
    return "bg-rose-500/15 text-rose-300 border border-rose-500/20";
  return "bg-white/10 text-white/50 border border-white/10";
};

const statusPill = (status) => {
  if (status === "VERIFIED")
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20";
  if (status === "PENDING")
    return "bg-amber-500/15 text-amber-300 border border-amber-500/20";
  if (status === "REJECTED")
    return "bg-rose-500/15 text-rose-300 border border-rose-500/20";
  return "bg-white/10 text-white/50 border border-white/10";
};

const InvoiceTable = ({ invoices, onCreate, canFund = false }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceForFund, setSelectedInvoiceForFund] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFundOpen, setIsFundOpen] = useState(false);
  if (!invoices || invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <ShieldAlert className="text-white/30" size={22} />
        </div>
        <h3 className="text-base font-medium text-white mb-1">
          No invoices found
        </h3>
        <p className="text-white/40 text-sm mb-6">
          Get started by creating your first invoice.
        </p>
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
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Invoice ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Buyer GSTIN
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Credit Score
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Risk
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-white/80">
                      #{invoice.id.toString().slice(-6)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-white/60 font-mono">
                      {invoice.buyerGstin}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-white">
                      ₹{Number(invoice.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-white/50">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-white/10 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-1 rounded-full ${
                            invoice.creditScore >= 80
                              ? "bg-emerald-400"
                              : invoice.creditScore >= 50
                                ? "bg-amber-400"
                                : "bg-rose-400"
                          }`}
                          style={{ width: `${invoice.creditScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/40 tabular-nums">
                        {invoice.creditScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full capitalize ${riskPill(invoice.riskLevel)}`}
                    >
                      {(invoice.riskLevel || "N/A").toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusPill(invoice.status)}`}
                    >
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
                      {canFund && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedInvoiceForFund(invoice);
                            setIsFundOpen(true);
                          }}
                          className="h-9 px-3 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-white/10 hover:border-white/20 transition-colors"
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
          onFund={
            canFund
              ? () => {
                  setIsViewOpen(false);
                  setSelectedInvoice(null);
                  setSelectedInvoiceForFund(selectedInvoice);
                  setIsFundOpen(true);
                }
              : undefined
          }
        />
      )}

      {/* Fund Invoice Modal — Lender only */}
      {canFund && isFundOpen && selectedInvoiceForFund && (
        <FundInvoiceDialog
          invoice={selectedInvoiceForFund}
          onClose={() => {
            setIsFundOpen(false);
            setSelectedInvoiceForFund(null);
          }}
        />
      )}
    </>
  );
};

export default InvoiceTable;
