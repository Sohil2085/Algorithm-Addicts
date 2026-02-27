import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyWallet, topUpWallet } from '../api/walletApi';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Activity, Clock, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import FinbridgeLoading from '../components/FinbridgeLoading';

const WalletPage = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const data = await getMyWallet();
                setWallet(data);
            } catch (error) {
                toast.error('Failed to load wallet data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchWallet();
        }
    }, [user]);

    const handleTopUp = async (e) => {
        e.preventDefault();

        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await topUpWallet(amount);
            setWallet(res.wallet);
            toast.success('Wallet topped up successfully!');
            setTopUpAmount('');
        } catch (error) {
            toast.error(error.message || 'Failed to top up wallet');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <FinbridgeLoading userName={user?.name} />;
    }

    const isLender = user?.role === 'LENDER';

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 py-10">
            {/* Background Effects */}
            <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-24 w-[400px] h-[400px] bg-cyan-500 rounded-full -z-10 blur-3xl opacity-[0.08] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 -z-10 pointer-events-none" />

            <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-4">
                            <Wallet size={14} className="text-blue-400" />
                            FinBridge Wallet
                        </div>
                        <h1 className="text-4xl font-semibold text-white tracking-tight">
                            Digital <span className="text-blue-400">Ledger</span>
                        </h1>
                        <p className="text-white/60 mt-2 text-sm">Manage your funds securely within the FinBridge ecosystem.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Balance Card (Spans 2 columns usually) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Balance Overview */}
                        <div className="bg-card border border-cardBorder rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={16} className="text-accent" /> Available Balance
                            </h2>
                            <div className="flex items-end gap-4">
                                <span className="text-5xl font-extrabold text-white tracking-tight">
                                    ₹{Number(wallet?.availableBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-cardBorder">
                                <div>
                                    <p className="text-sm text-muted mb-1 flex items-center gap-1.5"><ArrowUpRight size={14} className="text-success" /> Locked Balance (In Escrow)</p>
                                    <p className="text-xl font-bold text-white">₹{Number(wallet?.lockedBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted mb-1 flex items-center gap-1.5"><ArrowDownRight size={14} className="text-blue-400" /> Total Earnings</p>
                                    <p className="text-xl font-bold text-white">₹{Number(wallet?.totalEarnings || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-card border border-cardBorder rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {wallet?.recentActivity && wallet.recentActivity.length > 0 ? (
                                    wallet.recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl border border-cardBorder bg-bg0/50 hover:border-accent/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.isCredit ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'}`}>
                                                    {activity.isCredit ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{activity.title}</p>
                                                    <p className="text-xs text-muted">{activity.description} • {activity.status}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-4">
                                                <p className={`text-sm font-bold ${activity.isCredit ? 'text-success' : 'text-red-400'}`}>
                                                    {activity.isCredit ? '+' : '-'} ₹{Number(activity.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-xs text-muted flex items-center justify-end gap-1 mt-1">
                                                    <Clock size={12} /> {new Date(activity.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center border border-dashed border-cardBorder rounded-xl bg-bg0/30">
                                        <p className="text-sm text-white/70 font-medium">No recent activity</p>
                                        <p className="text-xs text-muted mt-1">Your funding and deal history will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Column (Top-up) for Lenders */}
                    <div className="space-y-6">
                        {isLender ? (
                            <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-blue-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <Plus size={20} className="text-blue-400" /> Add Funds
                                </h3>
                                <p className="text-sm text-muted mb-6">Top up your wallet to ensure you can quickly fund highly-demanded invoices.</p>

                                <form onSubmit={handleTopUp} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wide">Enter Amount (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">₹</span>
                                            <input
                                                type="number"
                                                min="1000"
                                                value={topUpAmount}
                                                onChange={(e) => setTopUpAmount(e.target.value)}
                                                className="w-full bg-[#0F172A] border border-cardBorder rounded-xl pl-8 pr-4 py-3 text-white placeholder-muted focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg font-semibold"
                                                placeholder="10,000"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {[10000, 50000, 100000].map(amt => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setTopUpAmount(amt.toString())}
                                                className="flex-1 py-2 rounded-lg border border-cardBorder text-xs font-semibold text-muted hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors"
                                            >
                                                +{amt / 1000}K
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary py-3.5 flex justify-center items-center gap-2 mt-2 shadow-lg shadow-blue-500/20"
                                    >
                                        {isSubmitting ? (
                                            <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                                        ) : (
                                            <><Zap size={18} /> Top Up Wallet</>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                                    <ShieldCheck size={16} className="text-blue-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-muted">Transfers are processed instantly via secure NEFT/RTGS gateways.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-card border border-cardBorder rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-white mb-2">Withdraw Funds</h3>
                                <p className="text-sm text-muted mb-6">MSMEs can automatically withdraw their available balance to their registered bank accounts.</p>
                                <button className="w-full py-3 rounded-xl border border-cardBorder text-sm font-semibold text-muted hover:text-white hover:border-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-2">
                                    <ArrowUpRight size={16} /> Request Withdrawal
                                </button>
                                <p className="text-xs text-center text-muted mt-4">Standard processing time: 1-2 business days.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
