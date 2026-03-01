import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create admin user
    const adminHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@internetmagazin.uz" },
        update: {},
        create: {
            fullName: "Tizim Administratori",
            email: "admin@internetmagazin.uz",
            phone: "+998901000001",
            passwordHash: adminHash,
            role: "ADMIN",
        },
    });

    // Create operator
    const opHash = await bcrypt.hash("operator123", 10);
    const operator = await prisma.user.upsert({
        where: { email: "operator@internetmagazin.uz" },
        update: {},
        create: {
            fullName: "Savdo Operatori",
            email: "operator@internetmagazin.uz",
            phone: "+998901000002",
            passwordHash: opHash,
            role: "OPERATOR",
        },
    });

    // Create pochta user
    const pochtaHash = await bcrypt.hash("pochta123", 10);
    await prisma.user.upsert({
        where: { email: "pochta@internetmagazin.uz" },
        update: {},
        create: {
            fullName: "Pochta Xodimi",
            email: "pochta@internetmagazin.uz",
            phone: "+998901000003",
            passwordHash: pochtaHash,
            role: "POCHTA",
        },
    });

    // Create ombor user
    const omborHash = await bcrypt.hash("ombor123", 10);
    await prisma.user.upsert({
        where: { email: "ombor@internetmagazin.uz" },
        update: {},
        create: {
            fullName: "Omborchi",
            email: "ombor@internetmagazin.uz",
            phone: "+998901000004",
            passwordHash: omborHash,
            role: "OMBOR",
        },
    });

    // Create sample products
    const products = [
        { name: "Proektr Epson EB-X51", category: "Elektronika", price: 3500000, stock: 10, sku: "PRJ-001" },
        { name: "Shurpavoy bosh (Elektr)", category: "Uy jihozlari", price: 280000, stock: 45, sku: "KIT-001" },
        { name: "FILIP 14 PRO Smartfon", category: "Elektronika", price: 5200000, stock: 8, sku: "PHN-001" },
        { name: "Samsung Galaxy A34", category: "Elektronika", price: 4100000, stock: 15, sku: "PHN-002" },
        { name: "Xiaomi Redmi Note 12", category: "Elektronika", price: 2900000, stock: 22, sku: "PHN-003" },
        { name: "Televizor 43 inch Smart", category: "Elektronika", price: 3800000, stock: 6, sku: "TV-001" },
        { name: "Changyutgich Dyson V11", category: "Uy jihozlari", price: 4500000, stock: 4, sku: "VC-001" },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { sku: product.sku },
            update: {},
            create: product,
        });
    }

    // Create sample customers
    const customers = [
        { fullName: "Aliyev Jasurbek Nosirovich", phone: "+998901234567", region: "Toshkent sh.", district: "Yunusobod", address: "47-mavze, 12-uy" },
        { fullName: "Toshmatova Dilnoza Hamidovna", phone: "+998901234568", region: "Samarqand", district: "Mirzo Ulug'bek", address: "Universitet ko'chasi 5" },
        { fullName: "Karimov Sherzod Baxtiyorovich", phone: "+998901234569", region: "Farg'ona", district: "Farg'ona", address: "Mustaqillik ko'chasi 23" },
    ];

    const createdCustomers = [];
    for (const c of customers) {
        const customer = await prisma.customer.upsert({
            where: { phone: c.phone },
            update: {},
            create: c,
        });
        createdCustomers.push(customer);
    }

    console.log("✅ Seed completed!");
    console.log("\n📋 Login ma'lumotlari:");
    console.log("  ADMIN:    admin@internetmagazin.uz / admin123");
    console.log("  OPERATOR: operator@internetmagazin.uz / operator123");
    console.log("  POCHTA:   pochta@internetmagazin.uz / pochta123");
    console.log("  OMBOR:    ombor@internetmagazin.uz / ombor123");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
