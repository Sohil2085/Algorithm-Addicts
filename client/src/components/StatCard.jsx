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
        <div className="rounded-2xl bg-theme-elevated/20 backdrop-blur-xl border border-theme-border p-6 shadow-Theme-sm hover:shadow-theme-md hover:border-theme-border-focus hover:bg-theme-elevated/40 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-5">
                <div className={`h-10 w-10 rounded-xl bg-theme-elevated/40 border border-theme-border flex items-center justify-center ${iconColor}`}>
                    {Icon && <Icon size={18} />}
                </div>
                {trendValue && (
                    <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                        }`}>
                        {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <p className="text-theme-text-muted text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
            <p className="text-3xl font-semibold text-theme-text tracking-tight">{value ?? '—'}</p>
        </div>
    );
};

export default StatCard;
