import React, { useState, useEffect } from 'react';

// ── Status messages cycling every 1.5 s ──────────────────────────────────────
const AI_MESSAGES = [
    'Checking GST validation...',
    'Running fraud detection...',
    'Calculating credit score...',
    'Evaluating risk factors...',
    'Preparing final results...',
];

// ── Row cell widths – varied per row for realism ─────────────────────────────
const ROW_CONFIGS = [
    [70, 58, 45, 38, 38, 30],
    [55, 72, 60, 44, 44, 42],
    [80, 50, 40, 36, 36, 38],
    [65, 64, 55, 42, 42, 34],
    [75, 54, 48, 40, 40, 44],
    [60, 68, 42, 38, 38, 28],
    [72, 60, 52, 44, 44, 36],
];

// ── Individual skeleton row with staggered glow ──────────────────────────────
const GlowRow = ({ cells, delay }) => (
    <tr
        className="border-b border-white/5 animate-row-glow"
        style={{ animationDelay: `${delay}s` }}
    >
        {cells.map((w, i) => (
            <td key={i} className="px-4 py-3.5">
                <div
                    className="h-3 rounded-full bg-white/[0.08] animate-pulse"
                    style={{
                        width: `${w}%`,
                        animationDelay: `${delay + i * 0.07}s`,
                    }}
                />
            </td>
        ))}
    </tr>
);

// ── Main component ────────────────────────────────────────────────────────────
/**
 * @param {boolean} isExiting  – set true just before unmounting to trigger
 *                               the fade-out transition (500 ms)
 */
const InvoicesLoading = ({ isExiting = false }) => {
    const [msgIndex, setMsgIndex] = useState(0);

    // Rotate AI status message every 1.5 s; re-keying the span re-triggers CSS animation
    useEffect(() => {
        const cycle = setInterval(() => {
            setMsgIndex(i => (i + 1) % AI_MESSAGES.length);
        }, 1500);
        return () => clearInterval(cycle);
    }, []);

    return (
        <div
            className="relative rounded-2xl border border-white/[0.08] overflow-hidden bg-white/[0.03] backdrop-blur-sm shadow-[0_0_60px_-20px_rgba(59,130,246,0.18)]"
            style={{
                transition: 'opacity 500ms ease',
                opacity: isExiting ? 0 : 1,
            }}
        >
            {/* 1️⃣  Shimmer sweep ──────────────────────────────────────── */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer" />
                </div>

                {/* 2️⃣ + 3️⃣  Combined status + AI badge row ─────────────────────────────── */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-blue-950/20">
                    {/* Left: spinning ring + rotating message */}
                    <div className="flex items-center gap-2.5">
                        <svg
                            className="h-3.5 w-3.5 text-blue-400 shrink-0"
                            style={{ animation: 'spin 1s linear infinite' }}
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span
                            key={msgIndex}
                            className="text-xs text-blue-300/80 font-medium tracking-wide animate-msg-fade"
                        >
                            {AI_MESSAGES[msgIndex]}
                        </span>
                    </div>
                    {/* Right: AI Reviewing badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 border border-blue-400/30 backdrop-blur-sm px-3 py-1 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ai-dot" />
                        <span className="text-xs font-medium text-blue-200 tracking-wide">
                            Reviewing Invoices...
                        </span>
                    </div>
                </div>

                {/* 4️⃣  Skeleton rows with staggered glow ─────────────────── */}
                <table className="w-full">
                    <tbody>
                        {ROW_CONFIGS.map((cells, i) => (
                            <GlowRow
                                key={i}
                                cells={cells}
                                delay={i * 0.18}
                            />
                        ))}
                    </tbody>
                </table>

                {/* Bottom footer skeleton */}
                <div className="flex items-center px-4 py-3 border-t border-white/[0.05] bg-white/[0.01]">
                    <div className="h-2.5 w-28 rounded-full bg-white/[0.06] animate-pulse" />
                </div>
        </div>
    );
};

export default InvoicesLoading;
