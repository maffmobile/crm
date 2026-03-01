import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rows } = body; // Array of row objects from Excel

    let created = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (const row of rows) {
        try {
            const phone = String(row.phone || "").trim();
            if (!phone) { errors++; continue; }

            const existing = await prisma.customer.findUnique({ where: { phone } });
            if (existing) { skipped++; continue; }

            await prisma.customer.create({
                data: {
                    fullName: String(row.fullName || "").trim(),
                    phone,
                    extraPhone: row.extraPhone ? String(row.extraPhone).trim() : null,
                    region: row.region ? String(row.region).trim() : null,
                    address: row.address ? String(row.address).trim() : null,
                    notes: row.notes ? String(row.notes).trim() : null,
                },
            });
            created++;
        } catch (e: any) {
            errors++;
            errorDetails.push(e.message);
        }
    }

    return NextResponse.json({ created, skipped, errors, errorDetails });
}
