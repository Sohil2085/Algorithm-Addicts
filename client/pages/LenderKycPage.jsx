import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, CheckCircle, AlertTriangle, ShieldCheck, Upload, X, CreditCard, Landmark, User, Hash, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/authApi';
import { useFeatures } from '../context/FeatureContext';

const LenderKycPage = () => {
    const navigate = useNavigate();
    const { user, login, token } = useAuth();
    const { features } = useFeatures();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [idProofFile, setIdProofFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        lenderType: 'INDIVIDUAL_INVESTOR', // Defaulting for simple UI
        panNumber: '',
        companyRegNumber: '',
        address: '',
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'panNumber' || name === 'ifscCode' ? value.toUpperCase() : value,
        }));
    };

    const validateStep1 = () => {
        return formData.panNumber && formData.panNumber.length === 10;
    };

    const validateStep2 = () => {
        return formData.address.trim().length > 0;
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) setIdProofFile(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) setIdProofFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep1() || !validateStep2()) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            // Map lender fields to new Lender KYC endpoint schema
            const payload = {
                lenderType: formData.lenderType,
                panNumber: formData.panNumber,
                registrationNumber: formData.companyRegNumber,
                organizationName: formData.companyRegNumber ? user?.name : undefined, // Example
                address: formData.address,
                bankAccountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                contactPersonName: formData.accountHolderName
            };

            await api.post('/lender/kyc/submit', payload);
            toast.success('KYC submitted successfully!');

            const updatedUser = { ...user, kycStatus: 'IN_PROGRESS' };
            login(token, updatedUser);

            setStep(3);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'KYC Submission failed');
        } finally {
            setLoading(false);
        }
    };

    // ── Same early-return screens as KycForm.jsx ──────────────────────────────

    if (features.LENDER_KYC === false) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="text-slate-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Feature Disabled</h2>
                <p className="text-white/60 mb-8 max-w-md">
                    The Lender KYC module is currently offline for maintenance. Please check back later.
                </p>
                <button onClick={() => navigate('/lender')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (user?.kycStatus === 'IN_PROGRESS') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-amber-500/20 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-amber-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">KYC Under Review</h2>
                    <p className="text-white/60 text-sm">Your profile is currently being verified by our team. You'll be notified once approved.</p>
                    <button
                        onClick={() => navigate('/lender')}
                        className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (user?.kycStatus === 'VERIFIED') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-emerald-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">KYC Verified</h2>
                    <p className="text-white/60 text-sm">Your profile is fully verified. You can now access all platform features including the marketplace.</p>
                    <button
                        onClick={() => navigate('/lender')}
                        className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (user?.kycStatus === 'REJECTED') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">KYC Rejected</h2>
                    <p className="text-white/60 text-sm">Your KYC was rejected. Please correct your details and resubmit for verification.</p>
                    <button
                        onClick={() => navigate('/lender/kyc/resubmit')}
                        className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                    >
                        Resubmit KYC
                    </button>
                    <button
                        onClick={() => navigate('/lender')}
                        className="block mx-auto mt-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ── Main Form (identical structure to KycForm.jsx) ────────────────────────

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center py-12 px-4">
            {/* Background elements — identical to KycForm */}
            <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-24 w-[400px] h-[400px] bg-indigo-500 rounded-full -z-10 blur-3xl opacity-[0.08] pointer-events-none" />

            <div className="max-w-3xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Complete Your Identity KYC</h1>
                    <p className="text-white/60">Verify your identity to unlock invoice marketplace access</p>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Stepper Header — identical structure to KycForm */}
                    <div className={`flex border-b border-white/10 bg-white/5 ${loading ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${step >= 1 ? 'text-blue-400 border-b-2 border-blue-500' : 'text-white/40'}`}>
                            1. Identity Info
                        </div>
                        <div className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${step >= 2 ? 'text-blue-400 border-b-2 border-blue-500' : 'text-white/40'}`}>
                            2. Documents & Bank
                        </div>
                        <div className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${step === 3 ? 'text-blue-400 border-b-2 border-blue-500' : 'text-white/40'}`}>
                            3. Review & Status
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Loading overlay — identical to KycForm */}
                        {loading && (
                            <div className="py-6 text-center space-y-6 animate-in fade-in duration-300">
                                <div className="mx-auto h-14 w-14 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
                                <div>
                                    <h2 className="text-2xl font-semibold text-white">Submitting KYC…</h2>
                                    <p className="mt-2 text-white/50 text-sm">We're verifying your identity details.<br />Please don't refresh this page.</p>
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                                    Reviewing
                                </div>
                            </div>
                        )}

                        {/* Form steps — hidden (not unmounted) while loading */}
                        <div className={loading ? 'hidden' : undefined}>

                            {/* ── STEP 1: Identity Info ── */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                                    {/* Lender Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Lender Category <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="lenderType"
                                                value={formData.lenderType}
                                                onChange={handleChange}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                                                required
                                            >
                                                <option value="INDIVIDUAL_INVESTOR">Individual Investor</option>
                                                <option value="REGISTERED_COMPANY">Registered Company</option>
                                                <option value="NBFC">NBFC</option>
                                                <option value="BANK">Bank</option>
                                                <option value="OTHER_FINANCIAL_ENTITY">Other Financial Entity</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PAN Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            PAN Number <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Hash size={18} className="text-white/30" />
                                            </div>
                                            <input
                                                type="text"
                                                name="panNumber"
                                                value={formData.panNumber}
                                                onChange={handleChange}
                                                maxLength={10}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white uppercase focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                                                placeholder="Enter PAN Number"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">10-character alphanumeric PAN (e.g. ABCDE1234F)</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Company Registration Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-2">Company Registration Number</label>
                                            <input
                                                type="text"
                                                name="companyRegNumber"
                                                value={formData.companyRegNumber}
                                                onChange={handleChange}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                placeholder="Enter Company Registration Number (Optional)"
                                            />
                                        </div>
                                        {/* Placeholder for grid alignment — same pattern as KycForm step 1 grid */}
                                        <div className="flex items-end">
                                            <div className="w-full bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-400/70 flex items-start gap-2">
                                                <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" />
                                                Company registration is optional for individual lenders. Required for institutional lenders.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => validateStep1() ? setStep(2) : toast.error('Please enter a valid 10-character PAN Number')}
                                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: Documents & Bank Details ── */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Registered Address <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                                                <MapPin size={18} className="text-white/30" />
                                            </div>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20 resize-none"
                                                placeholder="Enter Registered Address"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* ID Proof Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Upload ID Proof <span className="text-white/40 font-normal text-xs">(UI only – not submitted)</span>
                                        </label>
                                        {!idProofFile ? (
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                                onDragLeave={() => setDragging(false)}
                                                onDrop={handleFileDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`relative border-2 border-dashed rounded-xl py-8 px-6 text-center transition-all cursor-pointer ${dragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5'}`}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleFileInput}
                                                    className="hidden"
                                                />
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dragging ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/30'}`}>
                                                        <Upload size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white/60 text-sm">
                                                            <span className="text-blue-400 font-medium">Click to upload</span> or drag & drop
                                                        </p>
                                                        <p className="text-white/30 text-xs mt-1">PDF, JPG, PNG accepted</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 bg-slate-950 border border-white/10 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white truncate max-w-[240px]">{idProofFile.name}</p>
                                                        <p className="text-xs text-white/40">{(idProofFile.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIdProofFile(null)}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bank Account Details */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Landmark size={16} className="text-white/40" />
                                            <p className="text-sm font-medium text-white/80">Bank Account Details <span className="text-white/40 font-normal text-xs">(UI only – demo)</span></p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">Account Holder Name</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <User size={16} className="text-white/30" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="accountHolderName"
                                                        value={formData.accountHolderName}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                        placeholder="Full name as per bank records"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">Bank Name</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Landmark size={16} className="text-white/30" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="bankName"
                                                        value={formData.bankName}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                        placeholder="e.g. HDFC Bank"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">Account Number</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <CreditCard size={16} className="text-white/30" />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        name="accountNumber"
                                                        value={formData.accountNumber}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                        placeholder="Enter Account Number"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">IFSC Code</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Building2 size={16} className="text-white/30" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="ifscCode"
                                                        value={formData.ifscCode}
                                                        onChange={handleChange}
                                                        maxLength={11}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white uppercase focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                        placeholder="e.g. HDFC0001234"
                                                    />
                                                </div>
                                                <p className="text-xs text-white/40 mt-1">11-character IFSC code</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => setStep(1)}
                                            className="bg-transparent border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={handleSubmit}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            {loading ? 'Submitting…' : 'Submit KYC'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>{/* end form-steps wrapper */}

                        {/* ── STEP 3: Success Screen — identical to KycForm step 3 ── */}
                        {step === 3 && (
                            <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck className="text-emerald-500" size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Application Received</h2>
                                <p className="text-white/60 mb-8 max-w-md mx-auto">
                                    Your KYC application has been successfully submitted and is now under review by our administrators.
                                </p>

                                <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-6 max-w-sm mx-auto">
                                    <h3 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">Submission Summary</h3>

                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-white/80 font-medium">PAN Number</span>
                                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                            {formData.panNumber}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                        <span className="text-white/80 font-medium">Status</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
                                            IN REVIEW
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={() => navigate('/lender')}
                                        className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium transition-all"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LenderKycPage;
