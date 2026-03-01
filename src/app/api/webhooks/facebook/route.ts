/** Vercel Build Trigger: Comprehensive Fix Applied **/
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FB_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || "internet_magazin_fb_token_123";
const FB_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || "";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === FB_VERIFY_TOKEN) {
        console.log("✅ Facebook Webhook ulandi!");
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.object === "page") {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.field === "leadgen") {
                        const leadId = change.value.leadgen_id;
                        console.log("🔔 Yangi Facebook Lead keldi! ID:", leadId);

                        // Fetch lead details from Facebook Graph API
                        if (FB_ACCESS_TOKEN) {
                            const fbRes = await fetch(`https://graph.facebook.com/v18.0/${leadId}?access_token=${FB_ACCESS_TOKEN}`);
                            const leadData = await fbRes.json();

                            if (leadData && leadData.field_data) {
                                let fullName = "Facebook Lead";
                                let phone = "";

                                leadData.field_data.forEach((field: any) => {
                                    if (field.name === "full_name") fullName = field.values[0];
                                    if (field.name === "phone_number") phone = field.values[0];
                                });

                                if (phone) {
                                    // Admin user id for default operator
                                    const defaultOperator = await prisma.user.findFirst({ where: { role: "OPERATOR" } });
                                    const operatorId = defaultOperator?.id || "system";

                                    // 1. Create or Find Customer
                                    const customer = await prisma.customer.upsert({
                                        where: { phone },
                                        update: {},
                                        create: {
                                            fullName,
                                            phone,
                                            region: "Facebook",
                                        },
                                    });

                                    // 2. Create Order in the "YANGI" status column
                                    await prisma.order.create({
                                        data: {
                                            orderNumber: `FB-${Math.floor(Date.now() / 1000)}`,
                                            customerId: customer.id,
                                            operatorId: operatorId,
                                            status: "YANGI",
                                            totalSum: 0,
                                        },
                                    });
                                    console.log(`✅ CRM ga qo'shildi! Mijoz: ${fullName}, Tel: ${phone}`);
                                }
                            }
                        } else {
                            console.warn("⚠️ FACEBOOK_ACCESS_TOKEN kiritilmagan. Lidar tafsilotlarini yuklab bo'lmaydi.");
                        }
                    }
                }
            }
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
        }

        return new NextResponse("Not Found", { status: 404 });
    } catch (error) {
        console.error("Facebook Webhook xatosi:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
