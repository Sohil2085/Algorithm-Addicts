import prisma from '../config/prisma.js';

export const getMyDeals = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        const whereClause = role === 'LENDER' ? { lenderId: userId } : { msmeId: userId };

        const deals = await prisma.deal.findMany({
            where: whereClause,
            include: {
                invoice: { select: { invoice_number: true, due_date: true, amount: true } },
                lender: { select: { name: true } },
                msme: { select: { name: true } }
            }
        });

        res.status(200).json(deals);
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({ message: 'Server error retrieving deals' });
    }
};

export const fundDeal = async (req, res) => {
    try {
        const lenderId = req.user.id;
        const { id: dealId } = req.params;

        // 1. Verify lender matches deal
        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        if (deal.lenderId !== lenderId) {
            return res.status(403).json({ message: 'Unauthorized to fund this deal' });
        }

        if (deal.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Deal is not active' });
        }

        // 2. Verify wallet balance
        const lenderWallet = await prisma.wallet.findUnique({
            where: { userId: lenderId }
        });

        if (!lenderWallet) {
            return res.status(404).json({ message: 'Lender wallet not found' });
        }

        const fundedAmount = parseFloat(deal.fundedAmount);

        if (parseFloat(lenderWallet.availableBalance) < fundedAmount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // 3. Execute Prisma Transaction
        const transactionResult = await prisma.$transaction(async (tx) => {
            // Deduct from lender wallet availableBalance, increase lockedBalance
            const updatedLenderWallet = await tx.wallet.update({
                where: { userId: lenderId },
                data: {
                    availableBalance: { decrement: fundedAmount },
                    lockedBalance: { increment: fundedAmount }
                }
            });

            // Add to MSME wallet availableBalance
            const updatedMsmeWallet = await tx.wallet.upsert({
                where: { userId: deal.msmeId },
                update: {
                    availableBalance: { increment: fundedAmount }
                },
                create: {
                    userId: deal.msmeId,
                    availableBalance: fundedAmount,
                    lockedBalance: 0,
                    totalEarnings: 0
                }
            });

            return { lenderWallet: updatedLenderWallet, msmeWallet: updatedMsmeWallet };
        });

        res.status(200).json({ message: 'Deal funded successfully', result: transactionResult });
    } catch (error) {
        console.error('Error in fundDeal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const repayDeal = async (req, res) => {
    try {
        const { id: dealId } = req.params;

        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        if (deal.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Deal is not active or already closed' });
        }

        // 1. Calculate disbursements
        const fundedAmount = parseFloat(deal.fundedAmount);
        const interestAmount = parseFloat(deal.interestAmount);
        const platformFee = parseFloat(deal.platformFee);
        const invoiceAmount = parseFloat(deal.invoiceAmount);

        const lenderReceives = fundedAmount + interestAmount;
        const platformReceives = platformFee;
        const msmeReceives = invoiceAmount - lenderReceives - platformFee;

        // 2. Execute Prisma Transaction
        const transactionResult = await prisma.$transaction(async (tx) => {
            // Update Lender Wallet: add lenderReceives to available, deduct fundedAmount from locked, add interest to earnings
            await tx.wallet.update({
                where: { userId: deal.lenderId },
                data: {
                    availableBalance: { increment: lenderReceives },
                    lockedBalance: { decrement: fundedAmount },
                    totalEarnings: { increment: interestAmount }
                }
            });

            // Update MSME Wallet: add msmeReceives to available
            if (msmeReceives > 0) {
                await tx.wallet.upsert({
                    where: { userId: deal.msmeId },
                    update: { availableBalance: { increment: msmeReceives } },
                    create: {
                        userId: deal.msmeId,
                        availableBalance: msmeReceives,
                        lockedBalance: 0,
                        totalEarnings: 0
                    }
                });
            }

            // Close Deal
            const closedDeal = await tx.deal.update({
                where: { id: dealId },
                data: { status: 'CLOSED' }
            });

            // Close Invoice
            await tx.invoice.update({
                where: { id: deal.invoiceId },
                data: { status: 'CLOSED' }
            });

            return closedDeal;
        });

        res.status(200).json({ message: 'Deal repaid successfully', deal: transactionResult });
    } catch (error) {
        console.error('Error in repayDeal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
