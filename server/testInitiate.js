import prisma from './config/prisma.js';
async function main() {
    try {
        const deal = await prisma.deal.findUnique({
            where: { id: 'bccf6732-97c4-4da9-ba85-9e262742a75e' },
            include: {
                lender: { select: { id: true, kycStatus: true, name: true } },
                msme: { select: { id: true, kycStatus: true } },
            }
        });
        console.log('Deal found:', !!deal);
        if (!deal) return;

        const session = await prisma.callSession.upsert({
            where: { dealId: deal.id },
            create: { dealId: deal.id, lenderId: deal.lenderId, msmeId: deal.msmeId, status: 'INITIATED', roomToken: null },
            update: { status: 'INITIATED', startedAt: null, endedAt: null, durationSec: null, roomToken: null },
        });
        console.log('Session upserted successfully');
    } catch (err) {
        console.error('Error in upsert:', err);
    }
}
main().then(() => process.exit(0));
