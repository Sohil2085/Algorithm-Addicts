import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';

const WalletLoadingOverlayV2 = () => {
    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        "Verifying ledger...",
        "Updating escrow...",
        "Refreshing activity..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % statuses.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-slate-900/55 border border-theme-border rounded-2xl px-7 py-6 shadow-[0_0_70px_rgba(0,0,0,0.55)] backdrop-blur-xl flex flex-col items-center text-center w-[92%] max-w-md">

                {/* Loader Icon Block */}
                <div className="relative h-20 w-20 mb-6">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border border-blue-400/20"></div>

                    {/* Orbiting Group */}
                    <div
                        className="absolute inset-0"
                        style={{ animation: 'spin 2.8s linear infinite' }}
                    >
                        {/* Dot 1: Top Center */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_12px_rgba(255,200,0,0.35)] opacity-100"></div>

                        {/* Dot 2: Right Center */}
                        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_12px_rgba(255,200,0,0.35)] opacity-70"></div>

                        {/* Dot 3: Bottom Left */}
                        <div className="absolute bottom-[14.6%] left-[14.6%] -translate-x-1/2 translate-y-1/2 h-3 w-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_12px_rgba(255,200,0,0.35)] opacity-40"></div>
                    </div>

                    {/* Center Wallet Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-slate-950/60 border border-blue-400/30 flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.35)]">
                        <Wallet className="text-blue-400" size={20} />
                    </div>
                </div>

                {/* Text Content */}
                <h3 className="text-lg font-semibold text-theme-text mb-1 flex items-center justify-center gap-1">
                    Syncing Wallet Ledger
                    <span className="inline-flex w-4 text-left">
                        <span className="animate-[ping_1.4s_infinite] inline-block">.</span>
                        <span className="animate-[ping_1.4s_infinite_0.2s] inline-block">.</span>
                        <span className="animate-[ping_1.4s_infinite_0.4s] inline-block">.</span>
                    </span>
                </h3>

                <p className="text-sm text-theme-text-muted mb-3">
                    Securing transactions • Updating balances
                </p>

                {/* Micro Status Line */}
                <div className="h-5 overflow-hidden relative w-full flex justify-center">
                    <p
                        key={statusIndex}
                        className="text-xs text-blue-400/80 font-medium animate-[fadeInUp_0.3s_ease-out]"
                        style={{
                            animation: 'fadeInUp 0.3s ease-out forwards',
                        }}
                    >
                        {statuses[statusIndex]}
                    </p>
                </div>

                {/* Inline keyframes for the micro status animation */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}} />
            </div>
        </div>
    );
};

export default WalletLoadingOverlayV2;
