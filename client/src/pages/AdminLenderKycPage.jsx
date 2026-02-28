import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingLenderKyc, approveLenderKyc, rejectLenderKyc, verifyLenderChecklist } from '../api/adminApi';
import toast from 'react-hot-toast';
import {
    CheckCircle, XCircle, Search, Building2, ExternalLink,
    ArrowLeft, Calendar, MapPin, Hash, User, ShieldCheck, FileText, Briefcase
} from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import VerifiedBadge from '../components/VerifiedBadge';

const AdminLenderKycPage = () => {
    const navigate = useNavigate();
    const [kycRequests, setKycRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [checklistData, setChecklistData] = useState({
        isRbiVerified: false,
        isMcaVerified: false,
        isPanVerified: false,
        isBankVerified: false,
        verificationRemark: ''
    });
    const [submittingChecklist, setSubmittingChecklist] = useState(false);

    useEffect(() => {
        if (selectedRequest) {
            setChecklistData({
                isRbiVerified: selectedRequest.isRbiVerified || false,
                isMcaVerified: selectedRequest.isMcaVerified || false,
                isPanVerified: selectedRequest.isPanVerified || false,
                isBankVerified: selectedRequest.isBankVerified || false,
                verificationRemark: selectedRequest.adminRemark || ''
            });
        }
    }, [selectedRequest]);

    useEffect(() => {
        fetchAllKyc();
    }, []);

    const fetchAllKyc = async () => {
        setLoading(true);
        try {
            const data = await getPendingLenderKyc();
            setKycRequests(data.data || []);
            if (data.data?.length > 0 && !selectedRequest) {
                setSelectedRequest(data.data[0]);
            }
        } catch (error) {
            toast.error("Failed to load Lender KYC requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveLenderKyc(id);
            toast.success("Lender KYC Approved");
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
            await rejectLenderKyc(id, rejectReason);
            toast.success("Lender KYC Rejected");
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

    const handleChecklistSubmit = async () => {
        if (!selectedRequest) return;
        setSubmittingChecklist(true);
        try {
            const data = await verifyLenderChecklist(selectedRequest.userId, checklistData);
            toast.success(data.message || 'Lender verified');
            await fetchAllKyc();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Failed to save checklist');
        } finally {
            setSubmittingChecklist(false);
        }
    };

    const filteredRequests = kycRequests.filter(req =>
        req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Lender Verification System">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin')}
                    className="p-2 hover:bg-theme-surface-hover rounded-lg text-theme-text-muted hover:text-theme-text transition-colors border border-theme-border bg-theme-surface"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-theme-text">Lender Verification Inbox</h1>
                    <p className="text-sm text-theme-text-muted">Review and manage Lender profile KYC records.</p>
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
                                placeholder="Search by name, organization..."
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
                                <p className="text-sm">No Lender KYC records found.</p>
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
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-theme-text truncate max-w-[150px]">{req.organizationName || req.user?.name}</span>
                                                {req.isVerified && <VerifiedBadge size={14} />}
                                            </div>
                                            {req.verificationStatus === 'IN_REVIEW' && <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full whitespace-nowrap">Pending</span>}
                                        </div>
                                        <div className="text-xs text-theme-text-muted truncate flex items-center gap-1 mt-1">
                                            <Briefcase size={12} /> {req.lenderType.replace(/_/g, ' ')}
                                        </div>
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
                                            <Briefcase size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-2xl font-bold text-theme-text">{selectedRequest.organizationName || selectedRequest.user?.name}</h2>
                                                {selectedRequest.isVerified && <VerifiedBadge size={20} />}
                                            </div>
                                            <p className="text-theme-text-muted text-sm">Category: {selectedRequest.lenderType.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>

                                    {selectedRequest.verificationStatus === 'IN_REVIEW' && (
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
                                                        <CheckCircle size={16} /> Approve Lender
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                                {/* Validation Prompts */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                                    <ShieldCheck className="text-blue-400 mt-1 shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-blue-400 font-semibold mb-1">Verify Lender Identity</h3>
                                        <p className="text-theme-text-muted text-sm mb-3">Ensure that RBI Licenses, PAN Details, and corporate registration IDs perfectly match official financial records.</p>
                                    </div>
                                </div>

                                {/* Verification Checklist */}
                                <div>
                                    <h3 className="text-lg font-semibold text-theme-text mb-4 border-b border-theme-border pb-2">Verification Checklist</h3>
                                    <div className="space-y-4">
                                        {(selectedRequest.lenderType === 'BANK' || selectedRequest.lenderType === 'NBFC') && (
                                            <div className="flex items-center justify-between bg-theme-bg p-3 rounded-xl border border-theme-border">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={checklistData.isRbiVerified}
                                                        onChange={(e) => setChecklistData(prev => ({ ...prev, isRbiVerified: e.target.checked }))}
                                                        className="w-4 h-4 rounded text-blue-500 bg-theme-surface border-theme-border"
                                                    />
                                                    <span className="text-theme-text text-sm">RBI License Verified</span>
                                                </div>
                                                <a href={selectedRequest.lenderType === 'BANK' ? "https://www.rbi.org.in/scripts/banklinks.aspx" : "https://rbi.org.in/Scripts/BS_NBFCList.aspx"} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                                                    Check RBI <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        )}

                                        {(selectedRequest.lenderType === 'REGISTERED_COMPANY' || selectedRequest.lenderType === 'OTHER_FINANCIAL_ENTITY') && (
                                            <div className="flex items-center justify-between bg-theme-bg p-3 rounded-xl border border-theme-border">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={checklistData.isMcaVerified}
                                                        onChange={(e) => setChecklistData(prev => ({ ...prev, isMcaVerified: e.target.checked }))}
                                                        className="w-4 h-4 rounded text-blue-500 bg-theme-surface border-theme-border"
                                                    />
                                                    <span className="text-theme-text text-sm">
                                                        {selectedRequest.lenderType === 'REGISTERED_COMPANY' ? 'MCA Registration Verified' : 'Registration Verified'}
                                                    </span>
                                                </div>
                                                <a href="https://www.mca.gov.in/content/mca/global/en/mca/master-data/MDS.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                                                    Check MCA <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        )}

                                        {selectedRequest.lenderType === 'INDIVIDUAL_INVESTOR' && (
                                            <div className="flex items-center justify-between bg-theme-bg p-3 rounded-xl border border-theme-border">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={checklistData.isPanVerified}
                                                        onChange={(e) => setChecklistData(prev => ({ ...prev, isPanVerified: e.target.checked }))}
                                                        className="w-4 h-4 rounded text-blue-500 bg-theme-surface border-theme-border"
                                                    />
                                                    <span className="text-theme-text text-sm">PAN Verified</span>
                                                </div>
                                                <a href="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/verify-your-pan" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 whitespace-nowrap">
                                                    Verify PAN <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 bg-theme-bg p-3 rounded-xl border border-theme-border">
                                            <input
                                                type="checkbox"
                                                checked={checklistData.isBankVerified}
                                                onChange={(e) => setChecklistData(prev => ({ ...prev, isBankVerified: e.target.checked }))}
                                                className="w-4 h-4 rounded text-blue-500 bg-theme-surface border-theme-border"
                                            />
                                            <span className="text-theme-text text-sm">Bank Account Verified</span>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-theme-text-muted text-sm">Verification Remark</label>
                                            <textarea
                                                value={checklistData.verificationRemark}
                                                onChange={(e) => setChecklistData(prev => ({ ...prev, verificationRemark: e.target.value }))}
                                                className="w-full bg-theme-bg border border-theme-border text-theme-text rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-24"
                                                placeholder="Add any specific remarks here..."
                                            />
                                        </div>

                                        <button
                                            onClick={handleChecklistSubmit}
                                            disabled={submittingChecklist}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                        >
                                            {submittingChecklist ? <span className="animate-spin border-2 border-white/20 border-t-white w-4 h-4 rounded-full" /> : <ShieldCheck size={18} />}
                                            {selectedRequest.isVerified ? 'Update Verification' : 'Save & Verify Lender'}
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Details Grid */}
                                <div>
                                    <h3 className="text-lg font-semibold text-theme-text mb-4 border-b border-theme-border pb-2">Profile Documentation</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                                        {selectedRequest.registrationNumber && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Hash size={12} /> Registration Number</span>
                                                <p className="text-theme-text font-mono text-lg tracking-wider">{selectedRequest.registrationNumber}</p>
                                            </div>
                                        )}

                                        {selectedRequest.rbiLicenseNumber && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><ShieldCheck size={12} /> RBI License Number</span>
                                                <p className="text-theme-text font-mono text-lg tracking-wider text-amber-500">{selectedRequest.rbiLicenseNumber}</p>
                                            </div>
                                        )}

                                        {selectedRequest.gstNumber && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Hash size={12} /> GST Number</span>
                                                <p className="text-theme-text font-mono tracking-wider">{selectedRequest.gstNumber}</p>
                                            </div>
                                        )}

                                        {selectedRequest.panNumber && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Hash size={12} /> PAN Number</span>
                                                <p className="text-theme-text font-mono tracking-wider">{selectedRequest.panNumber}</p>
                                            </div>
                                        )}

                                        {selectedRequest.contactPersonName && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><User size={12} /> Contact Person</span>
                                                <p className="text-theme-text">{selectedRequest.contactPersonName}</p>
                                            </div>
                                        )}

                                        {selectedRequest.officialEmail && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs">Official Email</span>
                                                <p className="text-theme-text">{selectedRequest.officialEmail}</p>
                                            </div>
                                        )}

                                        {selectedRequest.capitalRange && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs">Capital Range</span>
                                                <p className="text-theme-text">{selectedRequest.capitalRange}</p>
                                            </div>
                                        )}

                                        {selectedRequest.riskPreference && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs">Risk Preference</span>
                                                <p className="text-emerald-400 font-medium">{selectedRequest.riskPreference}</p>
                                            </div>
                                        )}

                                        {selectedRequest.bankAccountNumber && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Building2 size={12} /> Bank Account</span>
                                                <p className="text-theme-text font-mono">{selectedRequest.bankAccountNumber}</p>
                                            </div>
                                        )}

                                        {selectedRequest.ifscCode && (
                                            <div className="space-y-1">
                                                <span className="text-theme-text-muted text-xs flex items-center gap-1.5"><Hash size={12} /> IFSC Code</span>
                                                <p className="text-theme-text font-mono">{selectedRequest.ifscCode}</p>
                                            </div>
                                        )}

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

export default AdminLenderKycPage;
