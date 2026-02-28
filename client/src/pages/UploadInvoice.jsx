import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck, AlertTriangle } from 'lucide-react';
import { createInvoice } from '../api/invoiceApi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FeatureGuard } from '../context/FeatureContext';

const UploadInvoice = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        buyerGstin: '',
        amount: '',
        dueDate: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.buyerGstin || !formData.amount || !formData.dueDate) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await createInvoice({
                ...formData,
                amount: parseFloat(formData.amount)
            });
            toast.success('Invoice created successfully!');
            navigate('/invoices'); // Redirect to list
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    if (user?.kycStatus !== 'VERIFIED') {
        return (
            <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-theme-surface border border-theme-border rounded-2xl p-8 text-center space-y-4 shadow-theme-md">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                        <AlertTriangle className="text-amber-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-theme-text">Verification Required</h2>
                    <p className="text-theme-text-muted text-sm leading-relaxed">You must complete your business KYC verification before you can upload and create new invoices.</p>
                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/kyc')}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                        >
                            Complete KYC
                        </button>
                        <button
                            onClick={() => navigate('/msme')}
                            className="w-full bg-theme-surface-hover hover:bg-theme-surface-active text-theme-text px-6 py-2.5 rounded-xl font-medium transition-colors border border-theme-border"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <FeatureGuard featureKey="INVOICE_MANAGEMENT_MODULE">
            <div className="min-h-screen relative overflow-hidden bg-theme-bg">
                <div className="absolute top-0 right-1/3 w-96 h-96 bg-theme-accent rounded-full -z-10 blur-3xl opacity-[0.10] pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-theme-bg via-theme-bg/40 to-theme-bg -z-10 pointer-events-none"></div>

                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-theme-text-muted hover:text-theme-text mb-8 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-theme-surface-hover"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>

                    <div className="rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-xl overflow-hidden shadow-theme-md">
                        {/* Card Header */}
                        <div className="px-8 pt-8 pb-6 border-b border-theme-border">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="h-9 w-9 rounded-xl bg-theme-accent/20 text-theme-accent flex items-center justify-center border border-theme-border-focus">
                                    <ShieldCheck size={18} />
                                </div>
                                <h1 className="text-xl font-semibold text-theme-text">Create New Invoice</h1>
                            </div>
                            <p className="text-theme-text-muted text-sm ml-12">Submit invoice details for fraud assessment and financing.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                            <div className="space-y-5">
                                {/* Buyer GSTIN */}
                                <div>
                                    <label className="block text-xs font-medium text-theme-text-muted uppercase tracking-wider mb-2">Buyer GSTIN</label>
                                    <input
                                        type="text"
                                        name="buyerGstin"
                                        value={formData.buyerGstin}
                                        onChange={handleChange}
                                        placeholder="e.g. 27AAAAA0000A1Z5"
                                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text text-sm placeholder-theme-text-muted/60 focus:outline-none focus:ring-2 focus:ring-theme-border-focus focus:border-theme-border-hover transition"
                                        required
                                    />
                                    <p className="mt-1.5 text-xs text-theme-text-muted">15-character GST Identification Number of the buyer</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-xs font-medium text-theme-text-muted uppercase tracking-wider mb-2">Invoice Amount (₹)</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text text-sm placeholder-theme-text-muted/60 focus:outline-none focus:ring-2 focus:ring-theme-border-focus focus:border-theme-border-hover transition"
                                            min="1"
                                            required
                                        />
                                        <p className="mt-1.5 text-xs text-theme-text-muted">Minimum ₹1</p>
                                    </div>

                                    {/* Due Date */}
                                    <div>
                                        <label className="block text-xs font-medium text-theme-text-muted uppercase tracking-wider mb-2">Due Date</label>
                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleChange}
                                            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-border-focus focus:border-theme-border-hover transition [color-scheme:light] dark:[color-scheme:dark]"
                                            required
                                        />
                                        <p className="mt-1.5 text-xs text-theme-text-muted">Invoice payment due date</p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-theme-border"></div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-theme-text-muted border border-theme-border hover:text-theme-text hover:bg-theme-surface-hover hover:border-theme-border-hover transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={15} />
                                            <span>Create Invoice</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </FeatureGuard>
    );
};

export default UploadInvoice;
