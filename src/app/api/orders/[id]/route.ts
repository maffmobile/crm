import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendTelegramNotification } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const order = await (prisma as any).order.findUnique({
        where: { id },
        include: {
            customer: { include: { tags: true } },
            operator: { select: { id: true, fullName: true, role: true, teamId: true } },
            items: { include: { product: true } },
            statusLogs: { include: { changedBy: { select: { id: true, fullName: true } } }, orderBy: { changedAt: "desc" } },
        },
    });

    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const body = await req.json();
    const { status, trackingNumber, notes, dispatchDate, contractNumber, postalIndex, deliveryType, receiptUrl, contractUrl } = body;

    const order = await (prisma as any).order.findUnique({
        where: { id },
        include: { customer: true }
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Role-based edit restrictions
    if (userRole === "OPERATOR" && order.operatorId !== userId && userRole !== "ADMIN") {
        // Operators can only edit their own orders unless admin
    }
    if (userRole === "OMBOR") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (notes !== undefined) updateData.notes = notes;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (dispatchDate !== undefined) updateData.dispatchDate = dispatchDate ? new Date(dispatchDate) : null;
    if (contractNumber !== undefined) updateData.contractNumber = contractNumber;
    if (postalIndex !== undefined) updateData.postalIndex = postalIndex;
    if (deliveryType !== undefined) updateData.deliveryType = deliveryType;
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;
    if (contractUrl !== undefined) updateData.contractUrl = contractUrl;

    const RESERVED_STATUSES = ["TASDIQLANDI", "POCHTAGA_TOPSHIRILDI", "YOLDA", "YETKAZILDI"];
    const AVAILABLE_STATUSES = ["YANGI", "QAYTA_ALOQA", "BEKOR_QILINDI", "QAYTARILDI"];

    const isReserved = (s: string) => RESERVED_STATUSES.includes(s);
    const isAvailable = (s: string) => AVAILABLE_STATUSES.includes(s);

    const updated = await (prisma as any).$transaction(async (tx: any) => {
        if (status && status !== order.status) {
            updateData.status = status;
            await tx.orderStatusLog.create({
                data: {
                    orderId: id,
                    oldStatus: order.status,
                    newStatus: status,
                    changedById: userId,
                },
            });

            // STOCK LOGIC
            const items = await tx.orderItem.findMany({ where: { orderId: id } });

            // Available -> Reserved: Deduct Stock
            if (isAvailable(order.status) && isReserved(status)) {
                for (const item of items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }
            // Reserved -> Available: Restore Stock
            else if (isReserved(order.status) && isAvailable(status)) {
                for (const item of items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
            }

            // TELEGRAM NOTIFICATION
            if (status === "TASDIQLANDI" || status === "BEKOR_QILINDI" || status === "QAYTARILDI") {
                const statusEmoji = status === "TASDIQLANDI" ? "✅" : "❌";
                await sendTelegramNotification(
                    `${statusEmoji} <b>Buyurtma holati o'zgardi</b>\n\n` +
                    `📦 Buyurtma: #${order.orderNumber}\n` +
                    `👤 Mijoz: ${order.customer?.fullName}\n` +
                    `🔄 Yangi holat: <b>${status}</b>\n` +
                    `👤 O'zgartirdi: ${session.user?.name || "Tizim"}`
                );
            }
        }

        return await tx.order.update({
            where: { id },
            data: updateData,
            include: {
                customer: true,
                items: { include: { product: true } },
                statusLogs: { include: { changedBy: { select: { id: true, fullName: true } } }, orderBy: { changedAt: "desc" } },
            },
        });
    });

    return NextResponse.json(updated);
}
