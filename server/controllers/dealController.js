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

        if (lenderWallet.availableBalance.lt(deal.fundedAmount)) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // 3. Execute Prisma Transaction
        const transactionResult = await prisma.$transaction(async (tx) => {
            // Deduct from lender wallet availableBalance, increase lockedBalance
            await tx.wallet.update({
                where: { userId: lenderId },
                data: {
                    availableBalance: { decrement: deal.fundedAmount },
                    lockedBalance: { increment: deal.fundedAmount }
                }
            });

            // Add to MSME wallet availableBalance
            await tx.wallet.upsert({
                where: { userId: deal.msmeId },
                update: {
                    availableBalance: { increment: deal.fundedAmount }
                },
                create: {
                    userId: deal.msmeId,
                    availableBalance: deal.fundedAmount,
                    lockedBalance: 0,
                    totalEarnings: 0
                }
            });

            const updatedWallet = await tx.wallet.findUnique({
                where: { userId: lenderId }
            });
            console.log("UPDATED WALLET:", updatedWallet);

            return { updatedWallet };
        });

        res.status(200).json({
            success: true,
            message: 'Deal funded successfully',
            data: { updatedWallet: transactionResult.updatedWallet }
        });
    } catch (error) {
        console.error('Error in fundDeal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const processRepayment = async (dealId) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Fetch deal.
        const deal = await tx.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) {
            throw new Error('Deal not found');
        }

        // 2/3. Ensure deal.status == ACTIVE. Block if CLOSED.
        if (deal.status !== 'ACTIVE') {
            if (deal.status === 'CLOSED') {
                throw new Error('Deal already closed');
            }
            throw new Error('Deal is not active');
        }

        // 3. Fetch lender wallet.
        const lenderWallet = await tx.wallet.findUnique({
            where: { userId: deal.lenderId }
        });

        if (!lenderWallet) {
            throw new Error('Lender wallet not found');
        }

        // 4. Fetch MSME wallet.
        const msmeWallet = await tx.wallet.findUnique({
            where: { userId: deal.msmeId }
        });

        if (!msmeWallet) {
            throw new Error('MSME wallet not found');
        }

        // 5. Calculate:
        const fundedAmount = parseFloat(deal.fundedAmount || 0);
        const interestAmount = parseFloat(deal.interestAmount || 0);
        const platformFee = parseFloat(deal.platformFee || 0);
        const invoiceAmount = parseFloat(deal.invoiceAmount || 0);

        // Decimal-safe math (rounding to 2 decimal places to avoid standard JS float errors)
        const lenderReceives = parseFloat((fundedAmount + interestAmount).toFixed(2));
        const msmeReceives = parseFloat((invoiceAmount - lenderReceives - platformFee).toFixed(2));

        // 6. Validate:
        const lockedBalance = parseFloat(lenderWallet.lockedBalance || 0);
        const decrementLock = Math.min(lockedBalance, fundedAmount);

        if (
            fundedAmount < 0 ||
            interestAmount < 0 ||
            platformFee < 0 ||
            invoiceAmount < 0 ||
            lenderReceives < 0 ||
            msmeReceives < 0
        ) {
            throw new Error('Calculated amounts cannot be negative');
        }

        // 4. Ensure no wallet becomes negative (Safety Check)
        const currentLenderAvailable = parseFloat(lenderWallet.availableBalance || 0);
        const currentMsmeAvailable = parseFloat(msmeWallet.availableBalance || 0);

        if ((currentLenderAvailable + lenderReceives) < 0) {
            throw new Error('Lender wrapper available balance would become negative');
        }
        if ((currentMsmeAvailable + msmeReceives) < 0) {
            throw new Error('MSME wallet available balance would become negative');
        }

        // 7. Update lender wallet:
        const updatedLenderWallet = await tx.wallet.update({
            where: { userId: deal.lenderId },
            data: {
                availableBalance: { increment: lenderReceives },
                lockedBalance: { decrement: decrementLock },
                totalEarnings: { increment: interestAmount }
            }
        });

        // 8. Update MSME wallet:
        const updatedMsmeWallet = await tx.wallet.update({
            where: { userId: deal.msmeId },
            data: {
                availableBalance: { increment: msmeReceives }
            }
        });

        // 9. Update deal:
        const updatedDeal = await tx.deal.update({
            where: { id: dealId },
            data: { status: 'CLOSED' }
        });

        // 10. Update invoice:
        await tx.invoice.update({
            where: { id: deal.invoiceId },
            data: { status: 'CLOSED' }
        });

        // 5. Log transaction result
        console.log(`[PROCESS_REPAYMENT] Successfully processed repayment for Deal ID: ${dealId}`);
        console.dir({ deal: updatedDeal, lenderWallet: updatedLenderWallet, msmeWallet: updatedMsmeWallet }, { depth: null });

        // 11. Return updated wallets and deal.
        return {
            deal: updatedDeal,
            lenderWallet: updatedLenderWallet,
            msmeWallet: updatedMsmeWallet
        };
    });
};

export const repayDeal = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!['ADMIN', 'CONTROLLER'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { id: dealId } = req.params;

        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) {
            return res.status(404).json({ success: false, message: 'Deal not found' });
        }

        // Detailed error blocks in route for 400 cases
        if (deal.status === 'CLOSED') {
            return res.status(400).json({ success: false, message: 'Deal already closed' });
        }

        if (deal.status !== 'ACTIVE') {
            return res.status(400).json({ success: false, message: 'Deal is not active' });
        }

        const result = await processRepayment(dealId);

        // 6. Return response:
        res.status(200).json({
            success: true,
            message: 'Repayment processed successfully',
            data: {
                deal: result.deal,
                lenderWallet: result.lenderWallet,
                msmeWallet: result.msmeWallet
            }
        });
    } catch (error) {
        console.error(`[REPAY_DEAL_ERROR] Deal ID: ${req.params.id} Error:`, error.message);

        // Return 400 for logic validation errors thrown from our process function
        if (error.message.includes('negative') || error.message.includes('Insufficient') || error.message.includes('already closed')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: 'Server error' });
    }
};
