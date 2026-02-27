import prisma from '../config/prisma.js';

export const getMyWallet = async (req, res) => {
    try {
        const userId = req.user.id;

        const wallet = await prisma.wallet.findUnique({
            where: { userId }
        });

        if (!wallet) {
            // Create a default wallet if none exists
            const newWallet = await prisma.wallet.create({
                data: {
                    userId,
                    availableBalance: 0,
                    lockedBalance: 0,
                    totalEarnings: 0
                }
            });
            return res.status(200).json(newWallet);
        }

        // Fetch recent deals for activity ledger
        const deals = await prisma.deal.findMany({
            where: {
                OR: [
                    { lenderId: userId },
                    { msmeId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                invoice: { select: { invoice_number: true } }
            }
        });

        const recentActivity = deals.map(deal => {
            const isMsme = deal.msmeId === userId;
            return {
                id: deal.id,
                title: isMsme ? (deal.status === 'ACTIVE' ? 'Deal Funding' : 'Deal Repaid') : (deal.status === 'ACTIVE' ? 'Deal Investment' : 'Investment Return'),
                description: `Invoice ${deal.invoice?.invoice_number || deal.invoiceId.substring(0, 6)}`,
                amount: isMsme
                    ? (deal.status === 'ACTIVE' ? deal.fundedAmount : deal.invoiceAmount)
                    : (deal.status === 'ACTIVE' ? deal.fundedAmount : deal.totalPayableToLender),
                isCredit: isMsme ? (deal.status === 'ACTIVE' ? true : false) : (deal.status === 'ACTIVE' ? false : true),
                date: deal.createdAt,
                status: deal.status
            };
        });

        res.status(200).json({ ...wallet, recentActivity });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ message: 'Server error retrieving wallet' });
    }
};

export const topUpWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { amount } = req.body;

        if (role !== 'LENDER') {
            return res.status(403).json({ message: 'Only Lenders can top up wallets' });
        }

        const topUpAmount = parseFloat(amount);
        if (isNaN(topUpAmount) || topUpAmount <= 0) {
            return res.status(400).json({ message: 'Invalid top-up amount' });
        }

        // Use Prisma transaction to ensure integrity
        const updatedWallet = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.upsert({
                where: { userId },
                update: {
                    availableBalance: { increment: topUpAmount }
                },
                create: {
                    userId,
                    availableBalance: topUpAmount,
                    lockedBalance: 0,
                    totalEarnings: 0
                }
            });
            return wallet;
        });

        res.status(200).json({
            message: 'Wallet topped up successfully',
            wallet: updatedWallet
        });
    } catch (error) {
        console.error('Error topping up wallet:', error);
        res.status(500).json({ message: 'Server error topping up wallet' });
    }
};
