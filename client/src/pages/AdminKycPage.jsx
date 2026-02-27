import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingKyc, approveKyc, rejectKyc } from '../api/adminApi';
import toast from 'react-hot-toast';
import {
    CheckCircle, XCircle, Search, Building2, ExternalLink,
    ArrowLeft, Calendar, MapPin, Hash, User, ShieldCheck, FileText
} from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';

const AdminKycPage = () => {
    const navigate = useNavigate();
    const [kycRequests, setKycRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllKyc();
    }, []);

    const fetchAllKyc = async () => {
        setLoading(true);
        try {
            const data = await getPendingKyc();
            setKycRequests(data.data || []);
            if (data.data?.length > 0 && !selectedRequest) {
                setSelectedRequest(data.data[0]);
            }
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
            if (selectedRequest?.id === id) {
                setSelectedRequest(null);
            }
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
            if (selectedRequest?.id === id) {
                setSelectedRequest(null);
            }
            setRejectingId(null);
            setRejectReason('');
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Rejection failed");
        }
    };

    const filteredRequests = kycRequests.filter(req =>
        req.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.legalName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="KYC Verification System">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin')}
                    className="p-2 hover:bg-theme-surface-hover rounded-lg text-theme-text-muted hover:text-theme-text transition-colors border border-theme-border bg-theme-surface"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-theme-text">KYC Verification Inbox</h1>
                    <p className="text-sm text-theme-text-muted">Review and manage MSME business KYC records.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
                {/* Left Panel - List */}
                <div className="lg:col-span-1 bg-theme-surface border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, GSTIN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-4 py-2 text-sm text-theme-text focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto w-full">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="p-8 text-center text-theme-text-muted">
                                <ShieldCheck size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No KYC records found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredRequests.map(req => (
                                    <button
                                        key={req.id}
                                        onClick={() => setSelectedRequest(req)}
                                        className={`w-full text-left p-4 transition-colors hover:bg-white/[0.04] ${selectedRequest?.id === req.id ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-theme-text truncate max-w-[180px]">{req.businessName}</span>
                                            {req.status === 'IN_PROGRESS' && <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full whitespace-nowrap">Pending</span>}
                                            {req.status === 'VERIFIED' && <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full whitespace-nowrap">Verified</span>}
                                            {req.status === 'REJECTED' && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full whitespace-nowrap">Rejected</span>}
                                        </div>
                                        <div className="text-xs text-theme-text-muted truncate">{req.legalName}</div>
                                        <div className="text-xs text-theme-text-muted mt-2 font-mono">{req.gstNumber}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Details */}
                <div className="lg:col-span-2 bg-theme-surface border border-white/5 rounded-2xl flex flex-col overflow-hidden relative">
                    {!selectedRequest ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-theme-text-muted h-full">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p>Select a KYC request from the list to view details.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-transparent">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-theme-text">{selectedRequest.businessName}</h2>
                                            <p className="text-theme-text-muted text-sm">Legal Entity: {selectedRequest.legalName}</p>
                                        </div>
                                    </div>

                                    {selectedRequest.status === 'IN_PROGRESS' && (
                                        <>
                                            {rejectingId === selectedRequest.id ? (
                                                <div className="flex items-center gap-2 bg-theme-bg p-1.5 rounded-lg border border-red-500/30">
                                                    <input
                                                        type="text"
                                                        placeholder="Reason for rejection..."
                                                        className="bg-transparent border-none text-sm text-theme-text focus:outline-none w-48 px-2"
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="text-theme-text-muted hover:text-theme-text-muted p-1">
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button onClick={() => handleReject(selectedRequest.id)} className="bg-red-500 hover:bg-red-600 text-theme-text px-3 py-1.5 rounded text-sm font-medium transition-colors">
                                                        Confirm
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setRejectingId(selectedRequest.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-theme-text rounded-xl transition-all font-medium text-sm border border-red-500/20"
                                                    >
                                                        <XCircle size={16} /> Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(selectedRequest.id)}
                                                        className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-theme-text rounded-xl transition-all font-medium text-sm shadow-lg shadow-emerald-500/20"
                                                    >
                                                        <CheckCircle size={16} /> Approve Context
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {selectedRequest.status === 'VERIFIED' && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 font-medium text-sm">
                                            <CheckCircle size={16} /> Verified
                                        </div>
                                    )}
                                    {selectedRequest.status === 'REJECTED' && (
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 font-medium text-sm">
                                                <XCircle size={16} /> Rejected
                                            </div>
                                            <span className="text-xs text-red-400">Reason: {selectedRequest.adminRemark}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Important Link */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                                    <ShieldCheck className="text-blue-400 mt-1 shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-blue-400 font-semibold mb-1">Mandatory Background Check</h3>
                                        <p className="text-theme-text-muted text-sm mb-3">Please cross-reference the submitted GSTIN and PAN details with the official government portal before approving.</p>
                                        <a
                                            href="https://services.gst.gov.in/services/searchtp"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-theme-text px-4 py-2 rounded-lg transition-colors font-medium shadow-lg"
                                        >
                                            Verify on GST Portal <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>

                                {/* Submitted Details Grid */}
                                <div>
                                    <h3 className="text-lg font-semibold text-theme-text mb-4 border-b border-theme-border pb-2">Business Documentation</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="space-y-1">
                                            <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Hash size={12} /> GST Number</span>
                                            <p className="text-theme-text font-mono text-lg tracking-wider">{selectedRequest.gstNumber}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Hash size={12} /> PAN Number</span>
                                            <p className="text-theme-text font-mono text-lg tracking-wider">{selectedRequest.panNumber}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Calendar size={12} /> Business Start Date</span>
                                            <p className="text-theme-text">{new Date(selectedRequest.businessStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Building2 size={12} /> Annual Turnover</span>
                                            <p className="text-theme-text font-semibold text-emerald-400">₹{selectedRequest.turnover.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><MapPin size={12} /> Registered Address (State Code: {selectedRequest.stateCode})</span>
                                            <p className="text-theme-text-muted bg-theme-surface-hover p-3 rounded-lg border border-white/5 mt-1">{selectedRequest.businessAddress}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Meta Data */}
                                <div>
                                    <h3 className="text-lg font-semibold text-theme-text mb-4 border-b border-theme-border pb-2">Account Meta</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="space-y-1">
                                            <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><User size={12} /> User Account Name</span>
                                            <p className="text-theme-text">{selectedRequest.user?.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-theme-text-muted text-xs">Registered Email</span>
                                            <p className="text-theme-text">{selectedRequest.user?.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Calendar size={12} /> Request Submitted On</span>
                                            <p className="text-theme-text">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminKycPage;
