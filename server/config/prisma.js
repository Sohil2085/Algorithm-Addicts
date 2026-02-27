import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    // Tolerate NeonDB cold starts (free tier suspends after inactivity)
    log: ['error'],
});

export default prisma;