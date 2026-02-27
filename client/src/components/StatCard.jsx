import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const iconColorMap = {
    accent: 'text-blue-400',
    success: 'text-emerald-400',
    danger: 'text-rose-400',
    warning: 'text-amber-400',
    accent2: 'text-violet-400',
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "accent" }) => {
    const isPositive = trend === 'up';
    const iconColor = iconColorMap[color] || iconColorMap.accent;

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-5">
                <div className={`h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center ${iconColor}`}>
                    {Icon && <Icon size={18} />}
                </div>
                {trendValue && (
                    <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        isPositive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                    }`}>
                        {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
            <p className="text-3xl font-semibold text-white tracking-tight">{value ?? '—'}</p>
        </div>
    );
};

export default StatCard;
