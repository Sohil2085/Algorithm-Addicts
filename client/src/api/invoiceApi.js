import api from './authApi';

// Initial invoice stats placeholder (Empty/Zero, no fake numbers)
const initialStats = {
    totalRevenue: '₹0',
    totalInvoices: 0,
    avgRiskScore: 0,
    // businessAge: 'N/A', // Removed to avoid showing if unknown
    revenueData: [],
    riskData: [
        { name: 'Safe', value: 0, color: '#22C55E' },
        { name: 'Medium', value: 0, color: '#f97316' },
        { name: 'High', value: 0, color: '#EF4444' },
    ]
};

const mapInvoiceFromBackend = (data) => {
    const riskAnalysis = data.risk_analysis || data.riskAnalysis || data;

    // Extract Fraud Score
    const fraudScore = riskAnalysis.fraudScore ??
        (data.fraud_flags && data.fraud_flags.length > 0 ? data.fraud_flags[0].riskScore : (data.fraudScore || 0));

    // Extract Credit Score & Risk Level
    const creditData = data.credit_score || {};
    const creditScore = riskAnalysis.finalScore ?? creditData.score ?? data.creditScore ?? 0;
    const riskLevel = riskAnalysis.creditRiskBand?.toUpperCase() ?? creditData.risk_level ?? data.riskLevel ?? 'UNKNOWN';

    return {
        id: data.id || data.invoiceId,
        amount: data.amount,
        dueDate: data.due_date || data.dueDate,
        buyerGstin: data.buyer_gstin || data.buyerGSTIN,
        createdAt: data.created_at || new Date().toISOString(),
        status: data.status,
        fraudScore: fraudScore,
        creditScore: creditScore,
        baseCreditScore: riskAnalysis.creditScore ?? creditScore,
        fraudProbability: riskAnalysis.fraudProbability ?? 0,
        riskLevel: riskLevel,
        breakdown: riskAnalysis.breakdown || riskAnalysis.breakdownJSON || null,
        original: data
    };
};

export const createInvoice = async (invoiceData) => {
    try {
        const payload = {
            amount: Number(invoiceData.amount),
            dueDate: new Date(invoiceData.dueDate).toISOString(),
            buyerGSTIN: invoiceData.buyerGstin
        };

        const response = await api.post('/invoices/create', payload);
        return mapInvoiceFromBackend(response.data.invoice);
    } catch (error) {
        throw error.response?.data?.error || error.response?.data?.message || 'Failed to create invoice';
    }
};

export const getInvoices = async () => {
    try {
        const response = await api.get('/invoices/my');
        return response.data.map(mapInvoiceFromBackend);
    } catch (error) {
        console.error("Get Invoices Error:", error);
        throw error.response?.data?.error || 'Failed to fetch invoices';
    }
};

export const getAvailableInvoices = async () => {
    try {
        const response = await api.get('/invoices/available');
        return response.data.map(mapInvoiceFromBackend);
    } catch (error) {
        console.error("Get Available Invoices Error:", error);
        throw error.response?.data?.error || 'Failed to fetch available invoices';
    }
};

export const getInvoiceStats = async () => {
    try {
        const invoices = await getInvoices();

        if (!invoices || invoices.length === 0) {
            return initialStats;
        }

        const totalInvoices = invoices.length;
        const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

        // --- Calculate Average Credit Score ---
        let totalCredit = 0;
        let creditCount = 0;
        invoices.forEach(inv => {
            if (inv.creditScore !== undefined) {
                totalCredit += inv.creditScore;
                creditCount++;
            }
        });
        const avgCreditScore = creditCount > 0 ? Math.round(totalCredit / creditCount) : 0;

        // --- Calculate Revenue Data (Monthly) ---
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6Months = {};

        // Initialize last 6 months with 0
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${monthNames[d.getMonth()]}`;
            last6Months[key] = 0;
        }

        invoices.forEach(inv => {
            const date = new Date(inv.createdAt);
            const key = monthNames[date.getMonth()];
            // Only aggregate if it falls within our tracked months (simplified logic)
            if (last6Months[key] !== undefined) {
                last6Months[key] += Number(inv.amount);
            }
        });

        const revenueData = Object.keys(last6Months).map(name => ({
            name,
            revenue: last6Months[name]
        }));


        // --- Calculate Risk Distribution based on Risk Level or Credit Score ---
        let safe = 0, medium = 0, high = 0;
        invoices.forEach(inv => {
            // Using Risk Level text if available, else fallback to score
            const level = inv.riskLevel;
            if (level === 'LOW') safe++;
            else if (level === 'MEDIUM') medium++;
            else if (level === 'HIGH') high++;
            else {
                // Fallback based on score if level missing
                const score = inv.creditScore;
                if (score >= 80) safe++;
                else if (score >= 50) medium++;
                else high++;
            }
        });

        const riskData = [
            { name: 'Safe', value: safe, color: '#22C55E' },
            { name: 'Medium', value: medium, color: '#f97316' },
            { name: 'High', value: high, color: '#EF4444' },
        ];


        // Format revenue display
        const formatRevenue = (val) => {
            if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
            if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
            if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
            return `₹${val}`;
        };

        return {
            totalRevenue: formatRevenue(totalRevenue),
            totalInvoices,
            avgRiskScore: avgCreditScore, // Processed as Credit Score now (0-100)
            revenueData, // Real data
            riskData,     // Real data
            businessAge: 'N/A'
        };
    } catch (error) {
        console.warn("Failed to fetch stats", error);
        return initialStats;
    }
};