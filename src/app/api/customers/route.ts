import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = search
        ? {
            OR: [
                { fullName: { contains: search } },
                { phone: { contains: search } },
            ],
        }
        : {};

    try {
        const [customers, total] = await Promise.all([
            (prisma as any).customer.findMany({
                where,
                include: {
                    tags: true,
                    _count: { select: { orders: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            (prisma as any).customer.count({ where }),
        ]);

        return NextResponse.json({ customers, total, page, limit });
    } catch (error) {
        console.error("Customers GET error:", error);
        return NextResponse.json({ error: "Ma'lumotlarni yuklashda xatolik", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { fullName, phone, extraPhone, region, district, address, notes, tags } = body;

    const customer = await prisma.customer.create({
        data: {
            fullName,
            phone,
            extraPhone,
            region,
            district,
            address,
            notes,
            tags: tags?.length ? { create: tags.map((tag: string) => ({ tag })) } : undefined,
        },
        include: { tags: true },
    });

    return NextResponse.json(customer, { status: 201 });
}
