import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, CheckCircle, AlertTriangle, ShieldCheck, Upload, Landmark, User, Hash, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/authApi';
import { useFeatures } from '../context/FeatureContext';

const LenderOnboardingPage = () => {
    const navigate = useNavigate();
    const { user, login, token } = useAuth();
    const { features } = useFeatures();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        lenderType: '',
        organizationName: '',
        registrationNumber: '',
        rbiLicenseNumber: '',
        gstNumber: '',
        panNumber: '',
        contactPersonName: '',
        contactPhone: '',
        officialEmail: '',
        capitalRange: '',
        riskPreference: '',
        bankAccountNumber: '',
        ifscCode: ''
    });

    // Options for dynamic selects
    const options = {
        lenderTypes: [
            { value: 'BANK', label: 'Bank' },
            { value: 'NBFC', label: 'NBFC' },
            { value: 'REGISTERED_COMPANY', label: 'Registered Company' },
            { value: 'INDIVIDUAL_INVESTOR', label: 'Individual Investor' },
            { value: 'OTHER_FINANCIAL_ENTITY', label: 'Other Financial Entity' }
        ],
        capitalRanges: [
            { value: '0-50L', label: 'Up to ₹50 Lakhs' },
            { value: '50L-2Cr', label: '₹50 Lakhs to ₹2 Crores' },
            { value: '2Cr-10Cr', label: '₹2 Crores to ₹10 Crores' },
            { value: '10Cr+', label: '₹10 Crores and above' }
        ],
        riskPreferences: [
            { value: 'CONSERVATIVE', label: 'Conservative (Low Risk, Stable Returns)' },
            { value: 'BALANCED', label: 'Balanced (Medium Risk, Moderate Returns)' },
            { value: 'AGGRESSIVE', label: 'Aggressive (High Risk, High Returns)' }
        ]
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'panNumber' || name === 'ifscCode' || name === 'gstNumber') ? value.toUpperCase() : value,
        }));
    };

    const handleLenderTypeSelection = (type) => {
        // Reset specific fields when changing type to prevent cross-type data pollution
        setFormData(prev => ({
            ...prev,
            lenderType: type,
            organizationName: '',
            registrationNumber: '',
            rbiLicenseNumber: '',
            gstNumber: '',
            panNumber: '',
            contactPersonName: '',
            contactPhone: '',
            officialEmail: '',
            capitalRange: '',
            riskPreference: '',
            bankAccountNumber: '',
            ifscCode: ''
        }));
        setStep(2);
    };

    // Validation matching backend exactly
    const validateStep2 = () => {
        const { lenderType, organizationName, registrationNumber, rbiLicenseNumber, panNumber } = formData;

        if (!lenderType) return false;

        if (lenderType === 'BANK') {
            if (!organizationName || !registrationNumber || !rbiLicenseNumber) return false;
        }

        if (lenderType === 'NBFC') {
            if (!registrationNumber || !rbiLicenseNumber) return false;
        }

        if (lenderType === 'REGISTERED_COMPANY') {
            if (!registrationNumber) return false;
        }

        if (lenderType === 'INDIVIDUAL_INVESTOR') {
            if (!panNumber || panNumber.length !== 10) return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep2()) {
            toast.error('Please fill in all required fields per your lender category.');
            return;
        }

        setLoading(true);
        try {
            // Strip out empty strings so Zod optional() doesn't fail on types
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v.trim() !== '')
            );

            await api.post('/lender/kyc/submit', payload);
            toast.success('KYC Submitted. Awaiting Admin Approval.');

            // Sync Context status
            const updatedUser = { ...user, kycStatus: 'IN_PROGRESS' };
            login(token, updatedUser);

            setStep(3);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'KYC Submission failed');
        } finally {
            setLoading(false);
        }
    };

    // ── Early return logic ──

    if (features.LENDER_KYC === false) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="text-slate-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Feature Disabled</h2>
                <p className="text-white/60 mb-8 max-w-md">The Lender KYC module is currently offline for maintenance.</p>
                <button onClick={() => navigate('/lender')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl">Return to Dashboard</button>
            </div>
        );
    }

    if (user?.kycStatus === 'IN_PROGRESS') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-amber-500/20 rounded-2xl p-8 text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-amber-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">KYC Under Review</h2>
                    <p className="text-white/60 text-sm">Your profile is currently being verified by our team. Awaiting Admin Approval.</p>
                    <button onClick={() => navigate('/lender')} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    if (user?.kycStatus === 'VERIFIED') {
        // As per constraints: "If verified: Redirect to marketplace."
        navigate('/lender'); // Presuming /lender represents the primary marketplace dashboard view in this scope
        return null;
    }

    if (user?.kycStatus === 'REJECTED') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">KYC Rejected</h2>
                    {/* UI placeholder for Admin Remark. If available globally it triggers here, else general text */}
                    <p className="text-white/60 text-sm">Your KYC was rejected. Please review your details and try again.</p>
                    <button onClick={() => {
                        // Reset forms
                        const updatedUser = { ...user, kycStatus: 'NOT_SUBMITTED' };
                        login(token, updatedUser);
                        setStep(1);
                    }} className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-medium">Resubmit KYC</button>
                    <button onClick={() => navigate('/lender')} className="block mx-auto mt-2 text-white/40 hover:text-white px-6 py-2.5 text-sm">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center py-12 px-4">
            <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-24 w-[400px] h-[400px] bg-indigo-500 rounded-full -z-10 blur-3xl opacity-[0.08] pointer-events-none" />

            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Lender Onboarding</h1>
                    <p className="text-white/60">Complete verification to build trust and activate marketplace access</p>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Stepper */}
                    <div className={`flex border-b border-white/10 bg-white/5 ${loading ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${step >= 1 ? 'text-blue-400 border-b-2 border-blue-500' : 'text-white/40'}`}>
                            Step 1: Select Type
                        </div>
                        <div className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${step >= 2 ? 'text-blue-400 border-b-2 border-blue-500' : 'text-white/40'}`}>
                            Step 2: Fill Details
                        </div>
                        <div className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${step === 3 ? 'text-blue-400 border-b-2 border-blue-500' : 'text-white/40'}`}>
                            Step 3: Submit Verification
                        </div>
                    </div>

                    <div className="p-8">
                        {loading && (
                            <div className="py-12 text-center space-y-6 animate-in fade-in duration-300">
                                <div className="mx-auto h-14 w-14 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
                                <div>
                                    <h2 className="text-2xl font-semibold text-white">Submitting KYC…</h2>
                                    <p className="mt-2 text-white/50 text-sm">Please don't refresh this page.</p>
                                </div>
                            </div>
                        )}

                        <div className={loading ? 'hidden' : undefined}>
                            {/* ── STEP 1: Lender Type ── */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-medium text-white mb-6">Who are you?</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {options.lenderTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => handleLenderTypeSelection(type.value)}
                                                className={`p-5 rounded-2xl border text-left transition-all group hover:-translate-y-1 hover:shadow-lg ${formData.lenderType === type.value
                                                        ? 'bg-blue-600/10 border-blue-500 shadow-blue-500/20'
                                                        : 'bg-slate-950 border-white/10 hover:border-white/30'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-medium ${formData.lenderType === type.value ? 'text-blue-400' : 'text-white/90'}`}>
                                                        {type.label}
                                                    </span>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.lenderType === type.value ? 'border-blue-500' : 'border-white/30 group-hover:border-white/50'
                                                        }`}>
                                                        {formData.lenderType === type.value && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-8 flex justify-end">
                                        <button
                                            type="button"
                                            disabled={!formData.lenderType}
                                            onClick={() => setStep(2)}
                                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-medium transition-colors"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: Fill Details ── */}
                            {step === 2 && (
                                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="flex items-center gap-2 text-xl font-medium text-white mb-6 pb-2 border-b border-white/10">
                                        <Building2 size={20} className="text-blue-400" />
                                        <span>{options.lenderTypes.find(t => t.value === formData.lenderType)?.label} Details</span>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* Shared Organization Name */}
                                        {['BANK', 'NBFC', 'REGISTERED_COMPANY', 'OTHER_FINANCIAL_ENTITY'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">
                                                    Organization Name {formData.lenderType === 'BANK' && <span className="text-red-400">*</span>}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="organizationName"
                                                    value={formData.organizationName}
                                                    onChange={handleChange}
                                                    required={formData.lenderType === 'BANK'}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                    placeholder="E.g. HDFC Bank Ltd."
                                                />
                                            </div>
                                        )}

                                        {/* Individual Full Name (Contact Person logically functions as name for individual context, mapped strictly for UI) */}
                                        {['INDIVIDUAL_INVESTOR'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contactPersonName"
                                                    value={formData.contactPersonName}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                    placeholder="As per PAN"
                                                />
                                            </div>
                                        )}

                                        {/* Shared Contact Person Name (Institutional) */}
                                        {['BANK', 'NBFC', 'OTHER_FINANCIAL_ENTITY'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">
                                                    Contact Person Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contactPersonName"
                                                    value={formData.contactPersonName}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                    placeholder="Primary Agent Name"
                                                />
                                            </div>
                                        )}

                                        {/* Registration Number */}
                                        {['BANK', 'NBFC', 'REGISTERED_COMPANY', 'OTHER_FINANCIAL_ENTITY'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">
                                                    Registration Number {['BANK', 'NBFC', 'REGISTERED_COMPANY'].includes(formData.lenderType) && <span className="text-red-400">*</span>}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="registrationNumber"
                                                    value={formData.registrationNumber}
                                                    onChange={handleChange}
                                                    required={['BANK', 'NBFC', 'REGISTERED_COMPANY'].includes(formData.lenderType)}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                    placeholder="CIN / LLPIN etc."
                                                />
                                            </div>
                                        )}

                                        {/* RBI License Number */}
                                        {['BANK', 'NBFC'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">
                                                    RBI License Number <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="rbiLicenseNumber"
                                                    value={formData.rbiLicenseNumber}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white uppercase focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                    placeholder="E.g. COI number"
                                                />
                                            </div>
                                        )}

                                        {/* GST Number */}
                                        {['REGISTERED_COMPANY'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">GST Number</label>
                                                <input
                                                    type="text"
                                                    name="gstNumber"
                                                    value={formData.gstNumber}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white uppercase focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                    placeholder="15-character GSTIN"
                                                />
                                            </div>
                                        )}

                                        {/* PAN Number */}
                                        {['INDIVIDUAL_INVESTOR'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">
                                                    PAN Number <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="panNumber"
                                                    value={formData.panNumber}
                                                    maxLength={10}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white uppercase focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                    placeholder="10-character alphanumeric"
                                                />
                                            </div>
                                        )}

                                        {/* Official Email */}
                                        {['BANK'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">Official Email</label>
                                                <input
                                                    type="email"
                                                    name="officialEmail"
                                                    value={formData.officialEmail}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                    placeholder="domain email"
                                                />
                                            </div>
                                        )}

                                        {/* Bank Account Numbers (Specifically requested in prompt for "BANK" type bizarrely, but satisfying requirements) */}
                                        {['BANK'].includes(formData.lenderType) && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-white/80 mb-2">Bank Account Number</label>
                                                    <input
                                                        type="password"
                                                        name="bankAccountNumber"
                                                        value={formData.bankAccountNumber}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                        placeholder="Corporate Acc No"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-white/80 mb-2">IFSC Code</label>
                                                    <input
                                                        type="text"
                                                        name="ifscCode"
                                                        value={formData.ifscCode}
                                                        onChange={handleChange}
                                                        maxLength={11}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white uppercase focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                                                        placeholder="Branch IFSC"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Capital Range */}
                                        {['BANK', 'NBFC', 'REGISTERED_COMPANY', 'INDIVIDUAL_INVESTOR'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">Capital Range (Liquidity)</label>
                                                <select
                                                    name="capitalRange"
                                                    value={formData.capitalRange}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                                >
                                                    <option value="" disabled>Select Range</option>
                                                    {options.capitalRanges.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {/* Risk Preference */}
                                        {['BANK', 'NBFC', 'INDIVIDUAL_INVESTOR'].includes(formData.lenderType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">Risk Preference</label>
                                                <select
                                                    name="riskPreference"
                                                    value={formData.riskPreference}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                                >
                                                    <option value="" disabled>Select Risk Band</option>
                                                    {options.riskPreferences.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </div>
                                        )}

                                    </div>

                                    <div className="pt-8 flex justify-between border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="bg-transparent border border-white/10 hover:bg-white/5 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Submit KYC
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── STEP 3: Fallback (shouldn't realistically hit this static state unless react render loop catches prior to IN_PROGRESS redirect) ── */}
                            {step === 3 && (
                                <div className="space-y-6 text-center animate-in zoom-in-95 duration-500 py-12">
                                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck className="text-emerald-500" size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Application Received</h2>
                                    <p className="text-white/60 mb-8 max-w-md mx-auto">KYC Submitted. Awaiting Admin Approval.</p>
                                    <button onClick={() => navigate('/lender')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium">Go to Dashboard</button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LenderOnboardingPage;
