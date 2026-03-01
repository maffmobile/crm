import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const users = await (prisma as any).user.findMany({
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, createdAt: true, teamId: true, team: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { fullName, email, phone, password, role, teamId } = body;
    const hash = await bcrypt.hash(password, 10);
    const user = await (prisma as any).user.create({
        data: { fullName, email, phone, passwordHash: hash, role, teamId },
        select: { id: true, fullName: true, email: true, role: true, isActive: true, teamId: true },
    });
    return NextResponse.json(user, { status: 201 });
}
