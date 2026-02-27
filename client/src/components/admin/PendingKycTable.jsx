import React, { useState, useEffect } from 'react';
import { getPendingKyc, approveKyc, rejectKyc } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Search, AlertCircle, Building2 } from 'lucide-react';

const PendingKycTable = () => {
    const [kycRequests, setKycRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPendingKyc();
    }, []);

    const fetchPendingKyc = async () => {
        setLoading(true);
        try {
            const data = await getPendingKyc();
            setKycRequests(data.data || []);
        } catch (error) {
            toast.error("Failed to load KYC requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveKyc(id);
            toast.success("KYC Approved");
            setKycRequests(prev => prev.filter(req => req.id !== id));
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Approval failed");
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        try {
            await rejectKyc(id, rejectReason);
            toast.success("KYC Rejected");
            setKycRequests(prev => prev.filter(req => req.id !== id));
            setRejectingId(null);
            setRejectReason('');
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Rejection failed");
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900 border border-theme-border rounded-2xl overflow-hidden p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-theme-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-theme-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-theme-text">Pending KYC Requests</h2>
                    <span className="bg-amber-500/20 text-amber-500 text-xs font-bold px-2 py-0.5 rounded-full">
                        {kycRequests.length}
                    </span>
                </div>
            </div>

            {kycRequests.length === 0 ? (
                <div className="p-12 text-center text-theme-text-muted">
                    <Building2 className="mx-auto mb-3 opacity-50" size={32} />
                    <p>No pending KYC requests at the moment.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70 min-w-[800px]">
                        <thead className="text-xs uppercase bg-theme-surface-hover text-theme-text-muted border-b border-theme-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Business / User</th>
                                <th className="px-6 py-4 font-medium">GST Details</th>
                                <th className="px-6 py-4 font-medium">Turnover</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {kycRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-theme-text">{req.businessName}</div>
                                        <div className="text-xs text-theme-text-muted">{req.user?.name} ({req.user?.email})</div>
                                        <div className="text-xs text-theme-text-muted mt-1">Submitted: {new Date(req.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-theme-text uppercase">{req.gstNumber}</div>
                                        <div className="text-xs text-theme-text-muted">{req.legalName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        ₹{req.turnover.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {rejectingId === req.id ? (
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                <input
                                                    type="text"
                                                    placeholder="Reason for rejection..."
                                                    className="bg-slate-950 border border-red-500/30 rounded px-3 py-1.5 text-xs text-theme-text focus:outline-none focus:border-red-500"
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                        className="text-theme-text-muted hover:text-theme-text text-xs px-2"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-theme-text text-xs px-3 py-1 rounded"
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-theme-text rounded-lg transition-colors border border-emerald-500/20"
                                                    title="Approve Business"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setRejectingId(req.id)}
                                                    className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-theme-text rounded-lg transition-colors border border-red-500/20"
                                                    title="Reject Business"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PendingKycTable;
