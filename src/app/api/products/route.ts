import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (search) where.name = { contains: search };
    if (activeOnly) where.isActive = true;

    const products = await prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "OMBOR") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "OMBOR") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(product);
}
