require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Attempting to connect to DB...');
        const userCount = await prisma.user.count();
        console.log('Successfully connected! Total users:', userCount);

        const admin = await prisma.user.findUnique({
            where: { email: 'admin@internetmagazin.uz' }
        });

        if (admin) {
            console.log('Admin user found:', admin.email);
            const bcrypt = require('bcryptjs');
            const isValid = await bcrypt.compare('admin123', admin.passwordHash);
            console.log('Password "admin123" is valid:', isValid);
            if (!isValid) {
                console.log('Stored hash:', admin.passwordHash);
            }
            console.log('Role:', admin.role);
            console.log('IsActive:', admin.isActive);
        } else {
            console.log('Admin user NOT found in database.');
        }
    } catch (err) {
        console.error('Prisma connection failed!');
        console.error(err.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
