import React, { useState, useEffect } from 'react';
import { getAgreement, signAgreement } from '../api/agreementApi';
import { FileText, CheckCircle, Clock, Shield, Loader2, X, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * AgreementModal
 * Props:
 *   dealId    {string}   - Deal ID
 *   onClose   {function} - Called when modal closes
 *   onSigned  {function} - Called after the current user signs (refreshes parent)
 */
export default function AgreementModal({ dealId, onClose, onSigned }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [signing, setSigning] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getAgreement(dealId);
                setData(res);
            } catch (err) {
                toast.error(err?.message || 'Failed to load agreement');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [dealId]);

    const handleSign = async () => {
        if (!agreed) return;
        setSigning(true);
        try {
            const res = await signAgreement(dealId);
            if (res.bothSigned) {
                toast.success('Agreement fully signed! Deal is now ACTIVE 🎉');
            } else {
                toast.success(res.message || 'Signed successfully!');
            }
            setDone(true);
            onSigned?.();
        } catch (err) {
            toast.error(err?.message || 'Failed to sign agreement');
        } finally {
            setSigning(false);
        }
    };

    const alreadySigned = data
        ? (data.userRole === 'MSME' ? data.msmeSigned : data.lenderSigned)
        : false;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
            <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <FileText size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-base">Financing Agreement</h2>
                            <p className="text-white/45 text-xs">Deal ID: {dealId?.slice(0, 8)}…</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Signature Status */}
                {data && !loading && (
                    <div className="px-6 pt-4 pb-2 flex gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${data.msmeSigned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                            {data.msmeSigned ? <CheckCircle size={12} /> : <Clock size={12} />}
                            MSME {data.msmeSigned ? 'Signed' : 'Pending'}
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${data.lenderSigned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                            {data.lenderSigned ? <CheckCircle size={12} /> : <Clock size={12} />}
                            Lender {data.lenderSigned ? 'Signed' : 'Pending'}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/40">
                            <Loader2 size={28} className="animate-spin" />
                            <p className="text-sm">Loading agreement…</p>
                        </div>
                    ) : done ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <p className="text-white font-semibold text-lg">Signed Successfully!</p>
                            <p className="text-white/50 text-sm text-center">
                                {data?.msmeSigned && data?.lenderSigned
                                    ? 'Both parties have signed. The deal is now ACTIVE and funds have been disbursed.'
                                    : 'Your signature has been recorded. Waiting for the other party to sign.'}
                            </p>
                            <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                                Close
                            </button>
                        </div>
                    ) : alreadySigned ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <PenLine size={32} className="text-blue-400" />
                            </div>
                            <p className="text-white font-semibold text-lg">Already Signed</p>
                            <p className="text-white/50 text-sm text-center">
                                You have already signed this agreement. Waiting for the other party.
                            </p>
                            <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Terms Text */}
                            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-5 text-sm text-white/75 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                                {data?.agreement?.terms}
                            </div>

                            {/* Deal Summary Cards */}
                            {data?.deal && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { label: 'Funded Amount', value: `₹${Number(data.deal.fundedAmount).toLocaleString('en-IN')}` },
                                        { label: 'Interest', value: `₹${Number(data.deal.interestAmount).toLocaleString('en-IN')}` },
                                        { label: 'Total Payable', value: `₹${Number(data.deal.totalPayableToLender).toLocaleString('en-IN')}` },
                                        { label: 'Platform Fee', value: `₹${Number(data.deal.platformFee).toLocaleString('en-IN')}` },
                                        { label: 'Due Date', value: new Date(data.deal.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                        { label: 'Status', value: data.deal.status.replace('_', ' ') },
                                    ].map(item => (
                                        <div key={item.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
                                            <p className="text-white/40 text-xs mb-1">{item.label}</p>
                                            <p className="text-white text-sm font-semibold">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {!loading && !done && !alreadySigned && (
                    <div className="px-6 py-5 border-t border-white/10 bg-white/5 space-y-4">
                        {/* Checkbox */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${agreed ? 'bg-blue-600 border-blue-600' : 'border-white/30 group-hover:border-white/50'}`}
                                onClick={() => setAgreed(v => !v)}>
                                {agreed && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <span className="text-sm text-white/60 leading-relaxed">
                                I have read, understood, and agree to the terms and conditions stated in this Financing Agreement.
                            </span>
                        </label>

                        {/* Security note */}
                        <div className="flex items-center gap-2 text-xs text-white/35">
                            <Shield size={12} />
                            <span>Your digital signature is legally binding on the FinBridge platform.</span>
                        </div>

                        {/* Sign Button */}
                        <button
                            onClick={handleSign}
                            disabled={!agreed || signing}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {signing ? (
                                <><Loader2 size={16} className="animate-spin" /> Signing…</>
                            ) : (
                                <><PenLine size={16} /> Sign Agreement</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
