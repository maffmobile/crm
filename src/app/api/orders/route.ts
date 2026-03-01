import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendTelegramNotification } from "@/lib/telegram";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";
    const operatorId = searchParams.get("operatorId");
    const teamId = searchParams.get("teamId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    const where: any = {};
    if (status) where.status = status;
    if (operatorId) where.operatorId = operatorId;
    // Pochta only sees relevant orders
    if (userRole === "POCHTA") {
        where.status = { in: ["OMBORGA_YUBORILDI", "POCHTAGA_TOPSHIRILDI", "YOLDA", "YETKAZILDI", "QAYTARILDI"] };
    }
    if (teamId) {
        where.operator = { teamId };
    }
    if (search) {
        where.OR = [
            { orderNumber: { contains: search } },
            { contractNumber: { contains: search } },
            { customer: { fullName: { contains: search } } },
            { customer: { phone: { contains: search } } },
        ];
    }

    const [orders, total] = await Promise.all([
        (prisma as any).order.findMany({
            where,
            include: {
                customer: { select: { id: true, fullName: true, phone: true, region: true } },
                operator: { select: { id: true, fullName: true, teamId: true } },
                items: { include: { product: { select: { id: true, name: true } } } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        (prisma as any).order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any).role;
    if (userRole === "POCHTA" || userRole === "OMBOR") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
        customerId,
        customer, // { fullName, phone, region, district, address }
        contractNumber,
        postalIndex,
        notes,
        items,
        contractDate,
        deliveryType,
        receiptUrl,
        contractUrl
    } = body;
    const operatorId = (session.user as any).id;

    const totalSum = items.reduce((acc: number, item: any) => acc + item.priceAtSale * item.quantity, 0);

    let finalCustomerId = customerId;

    // If customer data is provided, create or find customer
    if (customer && !customerId) {
        const existingCustomer = await (prisma as any).customer.findUnique({
            where: { phone: customer.phone }
        });
        if (existingCustomer) {
            finalCustomerId = existingCustomer.id;
        } else {
            const newCustomer = await (prisma as any).customer.create({ data: customer });
            finalCustomerId = newCustomer.id;
        }
    }

    const order = await (prisma as any).order.create({
        data: {
            customerId: finalCustomerId,
            operatorId,
            contractNumber,
            postalIndex,
            notes,
            contractDate: contractDate ? new Date(contractDate) : null,
            totalSum,
            deliveryType: deliveryType || "UZPOST",
            receiptUrl,
            contractUrl,
            items: {
                create: items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtSale: item.priceAtSale,
                })),
            },
            statusLogs: {
                create: {
                    newStatus: "YANGI",
                    changedById: operatorId,
                    note: "Buyurtma yaratildi",
                },
            },
        },
        include: {
            customer: true,
            items: { include: { product: true } },
        },
    });

    // Notify via Telegram
    const itemsText = items.map((item: any) => `• ${item.productId} (${item.quantity} ta)`).join("\n");
    await sendTelegramNotification(
        `🆕 <b>Yangi Buyurtma!</b>\n\n` +
        `👤 Mijoz: ${customer?.fullName || "Mavjud mijoz"}\n` +
        `📞 Tel: ${customer?.phone || "—"}\n` +
        `💰 Summa: ${totalSum.toLocaleString()} UZS\n` +
        `📃 Mahsulotlar:\n${itemsText}\n\n` +
        `👤 Operator: ${session.user?.name || "Tizim"}`
    );

    return NextResponse.json(order, { status: 201 });
}
