import React from 'react';

const RiskBadge = ({ level, score }) => {
    let colorClass = "bg-gray-500/10 text-gray-500 border-gray-500/20";
    let label = "Unknown";

    // Normalize input
    const riskLevel = level?.toUpperCase() || 'UNKNOWN';
    const riskScore = score !== undefined ? score : 0;

    // Determine color and label based on level or score
    if (riskLevel === 'HIGH' || riskScore > 7) {
        colorClass = "bg-danger/10 text-danger border-danger/20";
        label = "High Risk";
    } else if (riskLevel === 'MEDIUM' || (riskScore > 3 && riskScore <= 7)) {
        colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/20"; // Adding orange to config would be good, but falling back to text color
        label = "Medium Risk";
    } else if (riskLevel === 'LOW' || riskScore <= 3) {
        colorClass = "bg-success/10 text-success border-success/20";
        label = "Safe";
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current mr-1.5`}></span>
            {label}
            {score !== undefined && <span className="ml-1 opacity-75">({score}/100)</span>}
        </span>
    );
};

export default RiskBadge;
