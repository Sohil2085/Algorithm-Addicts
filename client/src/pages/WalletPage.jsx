import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyWallet, topUpWallet } from '../api/walletApi';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Activity, Clock, ShieldCheck, Zap, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import WalletLoadingOverlayV2 from '../components/WalletLoadingOverlayV2';

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

    const isLender = user?.role === 'LENDER';

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 py-10">
            {/* Background Effects */}
            <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-600 rounded-full -z-10 blur-3xl opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-24 w-[400px] h-[400px] bg-cyan-500 rounded-full -z-10 blur-3xl opacity-[0.08] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 -z-10 pointer-events-none" />

            <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[600px]">
                {/* Loading Overlay */}
                {loading && <WalletLoadingOverlayV2 />}

                {/* Blurred Content Wrapper */}
                <div className={`transition-all duration-300 ${loading ? 'pointer-events-none blur-[2px] opacity-60' : ''}`}>
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
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={16} className="text-blue-400" /> Available Balance
                            </h2>
                            <div className="flex items-end gap-4">
                                <span className="text-5xl font-extrabold text-white tracking-tight tabular-nums">
                                    ₹{Number(wallet?.availableBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-white/10">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1 flex items-center gap-1.5"><ArrowUpRight size={14} className="text-emerald-400" /> Locked Balance (In Escrow)</p>
                                    <p className="text-xl font-bold text-white tabular-nums">₹{Number(wallet?.lockedBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1 flex items-center gap-1.5"><ArrowDownRight size={14} className="text-blue-400" /> Total Earnings</p>
                                    <p className="text-xl font-bold text-white tabular-nums">₹{Number(wallet?.totalEarnings || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-lg backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {wallet?.recentActivity && wallet.recentActivity.length > 0 ? (
                                    wallet.recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                    {activity.isCredit ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{activity.title}</p>
                                                    <p className="text-xs text-slate-400">{activity.description} • {activity.status}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-4">
                                                <p className={`text-sm font-bold tabular-nums ${activity.isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {activity.isCredit ? '+' : '-'} ₹{Number(activity.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-1">
                                                    <Clock size={12} /> {new Date(activity.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02] flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                                            <Inbox className="text-blue-400" size={24} />
                                        </div>
                                        <p className="text-sm text-white/70 font-medium">No transactions yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Your funding and deal history will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Column (Top-up) for Lenders */}
                    <div className="space-y-6">
                        {isLender ? (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>

                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <Plus size={20} className="text-blue-400" /> Add Funds
                                </h3>
                                <p className="text-sm text-slate-400 mb-6">Top up your wallet to ensure you can quickly fund highly-demanded invoices.</p>

                                <form onSubmit={handleTopUp} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Enter Amount (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                            <input
                                                type="number"
                                                min="1000"
                                                value={topUpAmount}
                                                onChange={(e) => setTopUpAmount(e.target.value)}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg font-semibold tabular-nums"
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
                                                className="flex-1 py-2 rounded-lg border border-white/10 text-xs font-semibold text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors"
                                            >
                                                +{amt / 1000}K
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl flex justify-center items-center gap-2 mt-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 transition-all duration-300"
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
                                    <p className="text-xs text-slate-400">Transfers are processed instantly via secure NEFT/RTGS gateways.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500">
                                <h3 className="text-lg font-bold text-white mb-2">Withdraw Funds</h3>
                                <p className="text-sm text-slate-400 mb-6">MSMEs can automatically withdraw their available balance to their registered bank accounts.</p>
                                <button type="button" className="w-full py-3 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300 flex items-center justify-center gap-2">
                                    <ArrowUpRight size={16} /> Request Withdrawal
                                </button>
                                <p className="text-xs text-center text-slate-500 mt-4">Standard processing time: 1-2 business days.</p>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
