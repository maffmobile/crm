import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const operatorId = searchParams.get("operatorId");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const where: any = {};
    if (teamId) where.operator = { teamId };
    if (operatorId) where.operatorId = operatorId;

    const whereDelivered = { ...where, status: "YETKAZILDI" };
    const whereReturned = { ...where, status: "QAYTARILDI" };

    const [
        totalOrders,
        todayOrders,
        totals,
        monthRevenueData,
        deliveredCount,
        returnedCount,
        newCustomers,
        ordersByStatus,
        topProducts,
        teamsBreakdown,
    ] = await Promise.all([
        (prisma as any).order.count({ where }),
        (prisma as any).order.count({ where: { ...where, createdAt: { gte: today, lt: tomorrow } } }),
        (prisma as any).order.aggregate({
            where: whereDelivered,
            _sum: { totalSum: true }
        }),
        (prisma as any).order.aggregate({
            where: { ...whereDelivered, createdAt: { gte: monthStart } },
            _sum: { totalSum: true }
        }),
        (prisma as any).order.count({ where: whereDelivered }),
        (prisma as any).order.count({ where: whereReturned }),
        (prisma as any).customer.count({ where: { createdAt: { gte: monthStart } } }),
        (prisma as any).order.groupBy({ where, by: ["status"], _count: { status: true } }),
        (prisma as any).orderItem.groupBy({
            where: { order: where },
            by: ["productId"],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: 5,
        }),
        (prisma as any).team.findMany({
            select: {
                id: true,
                name: true,
                users: {
                    select: {
                        id: true,
                        _count: {
                            select: { orders: { where: { status: "YETKAZILDI" } } }
                        }
                    }
                }
            }
        })
    ]);

    const topProductIds = (topProducts as any[]).map((p: any) => p.productId);
    const topProductDetails = await (prisma as any).product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true },
    });

    const topProductsWithNames = (topProducts as any[]).map((p: any) => ({
        ...p,
        name: topProductDetails.find((d: any) => d.id === p.productId)?.name || "Noma'lum",
    }));

    const deliveryRate = totalOrders > 0 ? Math.round((deliveredCount / (deliveredCount + returnedCount || 1)) * 100) : 0;

    return NextResponse.json({
        totalOrders,
        todayOrders,
        totalRevenue: totals._sum.totalSum || 0,
        monthRevenue: monthRevenueData._sum.totalSum || 0,
        deliveredCount,
        returnedCount,
        deliveryRate,
        newCustomers,
        ordersByStatus,
        topProducts: topProductsWithNames,
        teamsBreakdown: teamsBreakdown.map((t: any) => ({
            id: t.id,
            name: t.name,
            deliveredOrders: t.users.reduce((acc: number, u: any) => acc + (u._count?.orders || 0), 0)
        }))
    });
}
