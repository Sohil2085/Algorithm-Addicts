import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const signup = async (userData) => {
    const { name, email, password, role } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || 'MSME',
        }
    });

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, kycStatus: user.kycStatus },
        process.env.JWT_SECRET || 'supersecret_fallback',
        { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
};

export const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, kycStatus: user.kycStatus },
        process.env.JWT_SECRET || 'supersecret_fallback',
        { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};
