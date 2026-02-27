import prisma from '../config/prisma.js';

export const getMyOffers = async (req, res) => {
    try {
        const msmeId = req.user.id;

        const offers = await prisma.fundingOffer.findMany({
            where: {
                invoice: { user_id: msmeId },
                status: 'PENDING'
            },
            include: {
                lender: { select: { id: true, name: true } },
                invoice: { select: { id: true, amount: true, invoice_number: true } }
            }
        });

        res.status(200).json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ message: 'Server error retrieving offers' });
    }
}

export const createOffer = async (req, res) => {
    try {
        const lenderId = req.user.id;
        const { invoiceId, fundedAmount, interestRate } = req.body;

        // 1. Validate lender is verified
        const lenderProfile = await prisma.lenderProfile.findUnique({
            where: { userId: lenderId }
        });

        if (!lenderProfile || lenderProfile.verificationStatus !== 'VERIFIED') {
            return res.status(403).json({ message: 'Lender is not verified' });
        }

        // 2. Validate invoice is OPEN_FOR_FUNDING
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId }
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (invoice.status !== 'OPEN_FOR_FUNDING' && invoice.status !== 'VERIFIED') {
            return res.status(400).json({ message: 'Invoice is not open for funding' });
        }

        // 3. Calculate interestAmount and platformFee
        const interestAmount = (parseFloat(fundedAmount) * (parseFloat(interestRate) / 100)).toFixed(2);
        const platformFee = (parseFloat(invoice.amount) * 0.01).toFixed(2);

        // 4. Verify lender wallet balance
        const lenderWallet = await prisma.wallet.findUnique({
            where: { userId: lenderId }
        });

        if (!lenderWallet || parseFloat(lenderWallet.availableBalance) < parseFloat(fundedAmount)) {
            return res.status(400).json({ message: 'Insufficient wallet balance to make this offer' });
        }

        // 5. Execute Prisma Transaction to create offer and lock funds
        const result = await prisma.$transaction(async (tx) => {
            // Deduct available balance and add to locked balance
            await tx.wallet.update({
                where: { userId: lenderId },
                data: {
                    availableBalance: { decrement: parseFloat(fundedAmount) },
                    lockedBalance: { increment: parseFloat(fundedAmount) }
                }
            });

            const offer = await tx.fundingOffer.create({
                data: {
                    invoiceId,
                    lenderId,
                    fundedAmount: parseFloat(fundedAmount),
                    interestRate: parseFloat(interestRate),
                    interestAmount: parseFloat(interestAmount),
                    platformFee: parseFloat(platformFee),
                    status: 'PENDING'
                }
            });

            return offer;
        });

        res.status(201).json({ message: 'Offer created successfully', offer: result });
    } catch (error) {
        console.error('Error in createOffer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const acceptOffer = async (req, res) => {
    try {
        const msmeId = req.user.id;
        const { id: offerId } = req.params;

        // 1. Validate offer and MSME ownership
        const offer = await prisma.fundingOffer.findUnique({
            where: { id: offerId },
            include: { invoice: true }
        });

        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        if (offer.invoice.user_id !== msmeId) {
            return res.status(403).json({ message: 'Unauthorized to accept this offer' });
        }

        if (offer.status !== 'PENDING') {
            return res.status(400).json({ message: 'Offer is not pending' });
        }

        // 2. Execute Prisma Transaction
        const transactionResult = await prisma.$transaction(async (tx) => {
            // Set offer status to ACCEPTED
            const acceptedOffer = await tx.fundingOffer.update({
                where: { id: offerId },
                data: { status: 'ACCEPTED' }
            });

            // Set invoice status to FUNDED
            const updatedInvoice = await tx.invoice.update({
                where: { id: offer.invoiceId },
                data: { status: 'FUNDED' }
            });

            // Handle Rejected Offers and restore locks
            const pendingOffers = await tx.fundingOffer.findMany({
                where: {
                    invoiceId: offer.invoiceId,
                    id: { not: offerId },
                    status: 'PENDING'
                }
            });

            for (const po of pendingOffers) {
                // Reject offer
                await tx.fundingOffer.update({
                    where: { id: po.id },
                    data: { status: 'REJECTED' }
                });

                // Unlock wallet funds: restore available, reduce locked
                await tx.wallet.update({
                    where: { userId: po.lenderId },
                    data: {
                        availableBalance: { increment: po.fundedAmount },
                        lockedBalance: { decrement: po.fundedAmount }
                    }
                });
            }

            // Create Deal
            // totalPayableToLender = fundedAmount + interestAmount
            const totalPayableToLender = parseFloat(offer.fundedAmount) + parseFloat(offer.interestAmount);

            const deal = await tx.deal.create({
                data: {
                    invoiceId: offer.invoiceId,
                    lenderId: offer.lenderId,
                    msmeId: msmeId,
                    invoiceAmount: updatedInvoice.amount,
                    fundedAmount: offer.fundedAmount,
                    interestAmount: offer.interestAmount,
                    platformFee: offer.platformFee,
                    totalPayableToLender: totalPayableToLender,
                    dueDate: updatedInvoice.due_date,
                    status: 'ACTIVE'
                }
            });

            // Transfer Funds for ACCEPTED offer: Move from Lender locked to MSME available
            await tx.wallet.update({
                where: { userId: offer.lenderId },
                data: {
                    lockedBalance: { decrement: parseFloat(offer.fundedAmount) }
                }
            });

            await tx.wallet.upsert({
                where: { userId: msmeId },
                update: {
                    availableBalance: { increment: parseFloat(offer.fundedAmount) }
                },
                create: {
                    userId: msmeId,
                    availableBalance: parseFloat(offer.fundedAmount),
                    lockedBalance: 0,
                    totalEarnings: 0
                }
            });

            return deal;
        });

        res.status(200).json({ message: 'Offer accepted successfully', deal: transactionResult });
    } catch (error) {
        console.error('Error in acceptOffer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
