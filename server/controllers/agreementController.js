import prisma from '../config/prisma.js';

/**
 * GET /api/agreement/:dealId
 * Accessible by MSME or Lender participant of the deal.
 */
export const getAgreement = async (req, res) => {
    try {
        const { dealId } = req.params;
        const userId = req.user.id;

        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { agreement: true }
        });

        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        if (deal.lenderId !== userId && deal.msmeId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!deal.agreement) {
            return res.status(404).json({ message: 'Agreement not found for this deal' });
        }

        return res.status(200).json({
            agreement: deal.agreement,
            deal: {
                id: deal.id,
                status: deal.status,
                fundedAmount: deal.fundedAmount,
                interestAmount: deal.interestAmount,
                platformFee: deal.platformFee,
                totalPayableToLender: deal.totalPayableToLender,
                dueDate: deal.dueDate,
            },
            userRole: deal.lenderId === userId ? 'LENDER' : 'MSME',
            msmeSigned: !!deal.agreement.msmeSignedAt,
            lenderSigned: !!deal.agreement.lenderSignedAt,
        });
    } catch (error) {
        console.error('[getAgreement]', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/agreement/:dealId/sign
 * Called by either MSME or Lender. When both have signed:
 *   - Deal status → ACTIVE
 *   - Funds transferred from lender locked → MSME available
 */
export const signAgreement = async (req, res) => {
    try {
        const { dealId } = req.params;
        const userId = req.user.id;

        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { agreement: true }
        });

        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        if (deal.lenderId !== userId && deal.msmeId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (deal.status !== 'AGREEMENT_PENDING') {
            return res.status(400).json({ message: 'Agreement is not pending or already active' });
        }

        if (!deal.agreement) {
            return res.status(404).json({ message: 'Agreement not found' });
        }

        const isLender = deal.lenderId === userId;
        const isMsme = deal.msmeId === userId;

        // Check if already signed
        if (isLender && deal.agreement.lenderSignedAt) {
            return res.status(400).json({ message: 'You have already signed this agreement' });
        }
        if (isMsme && deal.agreement.msmeSignedAt) {
            return res.status(400).json({ message: 'You have already signed this agreement' });
        }

        const now = new Date();

        // Update the signature timestamp
        const updateData = isLender
            ? { lenderSignedAt: now }
            : { msmeSignedAt: now };

        const updatedAgreement = await prisma.agreement.update({
            where: { id: deal.agreement.id },
            data: updateData
        });

        // Check if both have now signed
        const bothSigned = updatedAgreement.msmeSignedAt && updatedAgreement.lenderSignedAt;

        if (bothSigned) {
            // Both signed → activate deal and transfer funds
            await prisma.$transaction(async (tx) => {
                // Activate the deal
                await tx.deal.update({
                    where: { id: dealId },
                    data: { status: 'ACTIVE' }
                });

                // Move funds: Lender locked → MSME available
                await tx.wallet.update({
                    where: { userId: deal.lenderId },
                    data: {
                        lockedBalance: { decrement: parseFloat(deal.fundedAmount) }
                    }
                });

                await tx.wallet.upsert({
                    where: { userId: deal.msmeId },
                    update: {
                        availableBalance: { increment: parseFloat(deal.fundedAmount) }
                    },
                    create: {
                        userId: deal.msmeId,
                        availableBalance: parseFloat(deal.fundedAmount),
                        lockedBalance: 0,
                        totalEarnings: 0
                    }
                });
            });

            return res.status(200).json({
                message: 'Agreement fully signed. Deal is now ACTIVE and funds have been transferred.',
                bothSigned: true,
                dealStatus: 'ACTIVE'
            });
        }

        const waitingOn = isLender ? 'MSME' : 'Lender';
        return res.status(200).json({
            message: `Agreement signed successfully. Waiting for ${waitingOn} to sign.`,
            bothSigned: false,
            dealStatus: 'AGREEMENT_PENDING',
            msmeSigned: !!updatedAgreement.msmeSignedAt,
            lenderSigned: !!updatedAgreement.lenderSignedAt,
        });

    } catch (error) {
        console.error('[signAgreement]', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
