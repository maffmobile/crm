"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard, ShoppingCart, Users, Package,
    Truck, BarChart3, Settings, LogOut, Building2, Trello
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "OPERATOR"] },
    { href: "/customers", label: "Kontaktlar", icon: Users, roles: ["ADMIN", "OPERATOR"] },
    { href: "/voronka", label: "Voronka", icon: Trello, roles: ["ADMIN", "OPERATOR"] },
    { href: "/orders", label: "Buyurtmalar", icon: ShoppingCart, roles: ["ADMIN", "OPERATOR", "POCHTA"] },
    { href: "/products", label: "Mahsulotlar", icon: Package, roles: ["ADMIN", "OPERATOR", "OMBOR"] },
    { href: "/reports", label: "Hisobotlar", icon: BarChart3, roles: ["ADMIN"] },
    { href: "/users", label: "Foydalanuvchilar", icon: Settings, roles: ["ADMIN"] },
];

function getRoleName(role: string) {
    const map: Record<string, string> = {
        ADMIN: "Administrator", OPERATOR: "Savdo operatori",
        POCHTA: "Pochta bo'limi", OMBOR: "Omborchi",
    };
    return map[role] || role;
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || "";
    const userName = session?.user?.name || "";

    const visibleNav = navItems.filter((item) => item.roles.includes(userRole));
    const initials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">🛒</div>
                <div className="sidebar-logo-text">
                    <span className="sidebar-logo-title">Maffmobile</span>
                    <span className="sidebar-logo-sub">CRM Tizimi</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Asosiy</div>
                {visibleNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
                            <Icon className="nav-icon" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info" onClick={handleSignOut} title="Chiqish">
                    <div className="user-avatar">{initials}</div>
                    <div className="user-details">
                        <div className="user-name">{userName}</div>
                        <div className="user-role">{getRoleName(userRole)}</div>
                    </div>
                    <LogOut size={14} color="var(--text-muted)" />
                </div>
            </div>
        </aside>
    );
}
