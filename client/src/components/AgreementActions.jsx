import React from 'react';
import { Download, PenLine } from 'lucide-react';

const AgreementActions = ({
    isSigned,
    isDownloading,
    isSigning,
    onDownload,
    onSign
}) => {
    return (
        <div className="flex flex-col gap-2 items-start min-w-[140px]">
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${isSigned
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
            >
                {isSigned ? 'SIGNED' : 'PENDING'}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDownload(); }}
                    disabled={isDownloading}
                    aria-label="Download Agreement"
                    title="Download agreement PDF"
                    className={`
                        flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200
                        border border-white/10 bg-white/5 
                        ${isDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-white/20 text-theme-text'}
                    `}
                >
                    <Download size={14} />
                    {isDownloading ? '...' : 'Download'}
                </button>

                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSign(); }}
                    disabled={isSigned || isSigning}
                    aria-label="Sign Agreement"
                    title={isSigned ? "Already signed" : "Open e-sign flow"}
                    className={`
                        flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200
                        ${isSigned || isSigning
                            ? 'opacity-50 cursor-not-allowed bg-blue-600/30 text-white/50 border border-transparent'
                            : 'bg-blue-600/80 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,.25)]'
                        }
                    `}
                >
                    <PenLine size={14} />
                    {isSigning ? '...' : 'Sign'}
                </button>
            </div>
        </div>
    );
};

export default AgreementActions;
