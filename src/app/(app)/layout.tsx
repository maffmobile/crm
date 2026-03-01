import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/SessionProvider";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session) redirect("/login");

    return (
        <SessionProvider>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    {children}
                </div>
            </div>
        </SessionProvider>
    );
}
