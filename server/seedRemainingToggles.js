import prisma from './config/prisma.js';

async function main() {
    console.log('Inserting new feature flags...');

    await prisma.featureFlag.upsert({
        where: { featureKey: 'ANALYTICS_MODULE' },
        update: {},
        create: { featureKey: 'ANALYTICS_MODULE', isEnabled: true },
    });

    await prisma.featureFlag.upsert({
        where: { featureKey: 'COMMUNICATION_MODULE' },
        update: {},
        create: { featureKey: 'COMMUNICATION_MODULE', isEnabled: true },
    });

    console.log('New feature flags added successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
