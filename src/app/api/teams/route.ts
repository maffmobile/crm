import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const teams = await (prisma as any).team.findMany({
            include: {
                _count: { select: { users: true } },
                leader: { select: { id: true, fullName: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(teams);
    } catch (error) {
        return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    const user = session?.user as any;
    if (!session || user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 403 });
    }

    try {
        const { name, description, leaderId } = await req.json();
        if (!name) return NextResponse.json({ error: "Nomi majburiy" }, { status: 400 });

        const team = await (prisma as any).team.create({
            data: {
                name,
                description,
                leaderId: leaderId || null
            }
        });
        return NextResponse.json(team);
    } catch (error) {
        return NextResponse.json({ error: "Bunday nomli jamoa mavjud" }, { status: 400 });
    }
}
