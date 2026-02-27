import React from 'react';
import { Wallet } from 'lucide-react';

const WalletLoadingOverlay = () => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-slate-900/80 border border-theme-border rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.4)] backdrop-blur-xl flex flex-col items-center max-w-sm w-full mx-4">
                <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
                    {/* Animated Ring */}
                    <div className="absolute inset-0 border-2 border-theme-border rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-blue-400 rounded-full border-t-transparent animate-spin"></div>
                    {/* Center Icon */}
                    <Wallet className="text-blue-400 animate-pulse relative z-10" size={24} />
                </div>
                
                <h3 className="text-lg font-semibold text-theme-text mb-1 flex items-center gap-2">
                    Syncing Wallet Ledger
                    <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                    </span>
                </h3>
                <p className="text-sm text-theme-text-muted text-center">
                    Securing transactions • Updating balances
                </p>
            </div>
        </div>
    );
};

export default WalletLoadingOverlay;
