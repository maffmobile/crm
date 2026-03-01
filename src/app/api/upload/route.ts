import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = uniqueSuffix + "-" + file.name.replace(/\s+/g, "_");

        // Path: public/uploads/
        const uploadDir = join(process.cwd(), "public", "uploads");
        const path = join(uploadDir, filename);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        await writeFile(path, buffer);
        const url = `/uploads/${filename}`;

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Faylni yuklashda xatolik" }, { status: 500 });
    }
}
