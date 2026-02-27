import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building2, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/authApi';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [freshUser, setFreshUser] = useState(null);

    /* Fetch latest user data (includes gstin field) on mount */
    useEffect(() => {
        getMe()
            .then((data) => {
                if (data?.user) setFreshUser(data.user);
            })
            .catch(() => { /* silently fall back to AuthContext user */ });
    }, []);

    /* Prefer freshly fetched data; fall back to AuthContext */
    const profile = freshUser ?? user;

    if (!profile) return null;

    /* Derive a user alias pointing to the merged profile object */
    const u = profile;

    const getStatusConfig = () => {
        switch (u.kycStatus) {
            case 'VERIFIED':
                return {
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    icon: CheckCircle,
                    label: 'Verified Business'
                };
            case 'IN_PROGRESS':
                return {
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    icon: Clock,
                    label: 'KYC In Progress'
                };
            case 'REJECTED':
                return {
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    icon: AlertCircle,
                    label: 'KYC Rejected'
                };
            default:
                return {
                    color: 'text-slate-400',
                    bg: 'bg-slate-800',
                    border: 'border-slate-700',
                    icon: AlertCircle,
                    label: 'KYC Not Submitted'
                };
        }
    };

    const statusObj = getStatusConfig();
    const StatusIcon = statusObj.icon;

    /* Smart GSTIN display logic */
    const gstinDisplay = (() => {
        if (u.gstin) return u.gstin;
        if (u.kycStatus === 'VERIFIED')     return 'Verified (on file)';
        if (u.kycStatus === 'IN_PROGRESS')  return 'Pending admin review';
        if (u.kycStatus === 'REJECTED')     return 'Not accepted — resubmit KYC';
        return 'Not Provided';
    })();

    const gstinColor = u.gstin
        ? 'text-white'
        : u.kycStatus === 'VERIFIED'    ? 'text-emerald-400'
        : u.kycStatus === 'IN_PROGRESS' ? 'text-amber-400'
        : u.kycStatus === 'REJECTED'    ? 'text-red-400'
        : 'text-white/40';

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 py-12 px-4 sm:px-6">
            {/* Background elements */}
            <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.12] pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
                    <p className="text-white/60 mt-1 text-sm">Manage your account information and verification status</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Basic Info Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-blue-500/20">
                                {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-semibold text-white">{u.name}</h2>
                            <p className="text-white/60 text-sm mb-6">{u.role}</p>

                            <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${statusObj.border} ${statusObj.bg}`}>
                                <StatusIcon className={`${statusObj.color} mb-2`} size={28} />
                                <span className={`font-medium ${statusObj.color}`}>{statusObj.label}</span>
                                {u.kycStatus === 'NOT_SUBMITTED' && (
                                    <button
                                        onClick={() => navigate('/kyc')}
                                        className="mt-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors"
                                    >
                                        Complete KYC
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* KYC Rejection Reason (If applicable) */}
                        {u.kycStatus === 'REJECTED' && u.adminRemark && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 shadow-xl">
                                <h3 className="text-red-400 font-medium text-sm mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Rejection Reason
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed">{u.adminRemark}</p>
                                <button
                                    onClick={() => navigate('/kyc')}
                                    className="mt-4 w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold py-2 rounded-xl transition-colors"
                                >
                                    Resubmit KYC
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Detailed Information */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Account Details */}
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4 mb-6">Account Information</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 font-medium uppercase tracking-wider block mb-1">Full Name</label>
                                        <div className="text-white font-medium">{u.name}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 font-medium uppercase tracking-wider block mb-1">Email Address</label>
                                        <div className="text-white font-medium">{u.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 font-medium uppercase tracking-wider block mb-1">Account Role</label>
                                        <div className="text-white font-medium">{u.role}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Details (If applicable) */}
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            {u.kycStatus === 'NOT_SUBMITTED' && (
                                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center border border-white/5">
                                    <Shield className="text-white/20 mb-2" size={32} />
                                    <span className="text-white/60 text-sm font-medium">Complete KYC to view business details</span>
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4 mb-6">Business Details</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 font-medium uppercase tracking-wider block mb-1">GSTIN</label>
                                        <div className={`font-medium text-sm ${gstinColor}`}>{gstinDisplay}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 font-medium uppercase tracking-wider block mb-1">Business Age</label>
                                        <div className="text-white font-medium">{u.business_age ? `${u.business_age} Years` : 'Unknown'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
