import React, { useState, useEffect } from 'react';

const MESSAGES = [
    'Validating GSTIN records...',
    'Running fraud detection model...',
    'Analyzing repayment patterns...',
    'Calculating credit score...',
    'Finalizing dashboard insights...',
];

const FinbridgeLoading = ({ userName }) => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const cycle = setInterval(() => {
            // fade out → swap text → fade in
            setVisible(false);
            setTimeout(() => {
                setMsgIndex(i => (i + 1) % MESSAGES.length);
                setVisible(true);
            }, 400);
        }, 1800);
        return () => clearInterval(cycle);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-20 gap-10">

            {/* ── Personalised welcome ── */}
            <div className="text-center space-y-1.5">
                <h1 className="text-3xl font-semibold tracking-tight">
                    <span className="text-theme-text">Welcome back, </span>
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {userName || 'Partner'}
                    </span>
                    <span className="text-theme-text">.</span>
                </h1>
                <p className="text-theme-text-muted text-sm">Preparing your business insights…</p>
            </div>

            {/* ── AI scanning card ── */}
            <div
                className="
                    relative w-full max-w-2xl overflow-hidden
                    rounded-2xl border border-theme-border
                    bg-theme-elevated/20 backdrop-blur-xl
                    shadow-[0_0_60px_-12px_rgba(59,130,246,0.25)]
                    animate-float
                "
                style={{ minHeight: '260px' }}
            >
                {/* Blurred mock invoice layout */}
                <div className="p-6 space-y-4 blur-[2px] opacity-50 select-none pointer-events-none">
                    {/* mock header row */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-theme-elevated/40" />
                            <div className="h-3 w-44 rounded bg-theme-elevated/20" />
                        </div>
                        <div className="h-8 w-24 rounded-xl bg-blue-500/20" />
                    </div>
                    {/* mock KPI row */}
                    <div className="grid grid-cols-4 gap-3 pt-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 rounded-xl border border-theme-border bg-theme-elevated/20" />
                        ))}
                    </div>
                    {/* mock chart bar */}
                    <div className="h-28 rounded-xl border border-theme-border bg-theme-elevated/20">
                        <div className="flex items-end gap-2 h-full px-4 pb-3 pt-6">
                            {[60, 85, 45, 90, 70, 55, 80].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 rounded-t bg-blue-500/20"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Moving scan line */}
                <div className="absolute inset-x-0 top-0 pointer-events-none animate-scan">
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80" />
                    {/* glow trail below the line */}
                    <div className="h-16 w-full bg-gradient-to-b from-blue-400/10 to-transparent" />
                </div>

                {/* Corner badge */}
                <div className="absolute top-6 right-6 z-30">
                    <div className="inline-flex items-center gap-2
               rounded-full
               bg-theme-bg/90
               border border-theme-accent-subtle/40
               px-4 py-1.5
               text-sm font-semibold text-blue-200
               shadow-[0_0_15px_rgba(59,130,246,0.25)]">

                        <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shrink-0 relative top-[4px]" />

                        Analyzing
                    </div>
                </div>
            </div>

            {/* ── Rotating status message ── */}
            <div className="h-5 flex items-center justify-center">
                <p
                    className="text-sm text-theme-text-muted transition-opacity duration-400"
                    style={{ opacity: visible ? 1 : 0 }}
                >
                    {MESSAGES[msgIndex]}
                </p>
            </div>

            {/* ── Progress dots ── */}
            <div className="flex gap-1.5">
                {MESSAGES.map((_, i) => (
                    <span
                        key={i}
                        className="block h-1 rounded-full transition-all duration-500"
                        style={{
                            width: i === msgIndex ? '20px' : '6px',
                            backgroundColor: i === msgIndex
                                ? 'rgba(96,165,250,0.9)'
                                : 'rgba(255,255,255,0.15)',
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default FinbridgeLoading;
