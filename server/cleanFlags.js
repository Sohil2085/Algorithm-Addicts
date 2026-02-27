import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
    await prisma.featureFlag.deleteMany();
    console.log('Cleaned old feature flags');
    await prisma.$disconnect();
}

clean();
