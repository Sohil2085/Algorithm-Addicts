import React from 'react';
import { Check } from 'lucide-react';

const VerifiedBadge = ({ size = 16, className = '' }) => {
    return (
        <div
            className={`inline-flex items-center justify-center rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] ${className}`}
            style={{ width: size, height: size, minWidth: size, minHeight: size }}
            title="Verified Lender"
        >
            <Check size={size * 0.7} className="text-white" strokeWidth={3} />
        </div>
    );
};

export default VerifiedBadge;
