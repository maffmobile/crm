"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingCart, Users, TrendingUp, Package, Truck, CheckCircle, XCircle } from "lucide-react";

interface Stats {
    totalOrders: number;
    todayOrders: number;
    totalRevenue: number;
    monthRevenue: number;
    deliveredCount: number;
    returnedCount: number;
    deliveryRate: number;
    newCustomers: number;
    ordersByStatus: { status: string; _count: { status: number } }[];
    topProducts: { productId: string; name: string; _sum: { quantity: number } }[];
}

const STATUS_LABELS: Record<string, string> = {
    YANGI: "Yangi", TASDIQLANDI: "Tasdiqlandi", OMBORGA_YUBORILDI: "Omborda",
    POCHTAGA_TOPSHIRILDI: "Pochtada", YOLDA: "Yo'lda",
    YETKAZILDI: "Yetkazildi", QAYTARILDI: "Qaytarildi", BEKOR_QILINDI: "Bekor qilindi",
};

const STATUS_COLORS: Record<string, string> = {
    YANGI: "#60a5fa", TASDIQLANDI: "#34d399", OMBORGA_YUBORILDI: "#fbbf24",
    POCHTAGA_TOPSHIRILDI: "#c084fc", YOLDA: "#f472b6",
    YETKAZILDI: "#4ade80", QAYTARILDI: "#f87171", BEKOR_QILINDI: "#94a3b8",
};

function formatSum(n: number) {
    return new Intl.NumberFormat("uz-UZ").format(n) + " UZS";
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/stats")
            .then((r) => r.json())
            .then((data) => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="page-content">
            <div className="loading-center">
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        </div>
    );

    if (!stats) return <div className="page-content"><div className="alert alert-error">Ma'lumotlar yuklanmadi</div></div>;

    return (
        <div className="page-content">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📊 Dashboard</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Tizim umumiy ko'rsatkichlari</p>
            </div>

            {/* KPI CARDS */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon blue"><ShoppingCart size={24} /></div>
                    <div className="stat-label">Jami buyurtmalar</div>
                    <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
                    <div className="stat-change glass" style={{ padding: "4px 8px", borderRadius: 8, display: "inline-block" }}>
                        Bugun: <span className="text-success fw-bold">+{stats.todayOrders}</span>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green"><TrendingUp size={24} /></div>
                    <div className="stat-label">Oylik daromad</div>
                    <div className="stat-value" style={{ fontSize: 24 }}>{formatSum(stats.monthRevenue)}</div>
                    <div className="stat-change glass" style={{ padding: "4px 8px", borderRadius: 8, display: "inline-block" }}>
                        Jami: <span className="text-success fw-bold">{formatSum(stats.totalRevenue)}</span>
                    </div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon purple"><CheckCircle size={24} /></div>
                    <div className="stat-label">Muvaffaqiyatli yetkazish</div>
                    <div className="stat-value">{stats.deliveryRate}%</div>
                    <div className="stat-change glass" style={{ padding: "4px 8px", borderRadius: 8, display: "inline-block" }}>
                        <span className="text-secondary">{stats.deliveredCount} ta buyurtma</span>
                    </div>
                </div>
                <div className="stat-card pink">
                    <div className="stat-icon pink"><XCircle size={24} /></div>
                    <div className="stat-label">Qaytarilgan</div>
                    <div className="stat-value">{stats.returnedCount}</div>
                    <div className="stat-change glass" style={{ padding: "4px 8px", borderRadius: 8, display: "inline-block" }}>
                        <span className="text-danger">Bekor qilinganlar bilan</span>
                    </div>
                </div>
            </div>

            {/* STATUS DISTRIBUTION + TOP PRODUCTS */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, marginTop: 12 }}>
                {/* Status breakdown */}
                <div className="card card-padded">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h3 className="section-title" style={{ margin: 0 }}>Buyurtmalar holati bo'yicha</h3>
                        <div className="chip">{stats.ordersByStatus.length} ta holat</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px" }}>
                        {stats.ordersByStatus.map((item) => {
                            const total = stats.totalOrders || 1;
                            const percent = Math.round((item._count.status / total) * 100);
                            const color = STATUS_COLORS[item.status] || "var(--accent-primary)";
                            return (
                                <div key={item.status} style={{ position: "relative" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "baseline" }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{STATUS_LABELS[item.status] || item.status}</span>
                                        <span style={{ fontSize: 13, fontWeight: 800, color }}>{item._count.status}</span>
                                    </div>
                                    <div style={{ height: 8, background: "rgba(255,255,255,0.03)", borderRadius: 4, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${percent}%`,
                                            background: `linear-gradient(90deg, ${color}88, ${color})`,
                                            borderRadius: 4,
                                            boxShadow: `0 0 10px ${color}44`,
                                            transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)"
                                        }} />
                                    </div>
                                    <div style={{ position: "absolute", top: -8, right: 0, fontSize: 10, color: "var(--text-muted)", opacity: 0.5 }}>{percent}%</div>
                                </div>
                            );
                        })}
                    </div>
                    {stats.ordersByStatus.length === 0 && (
                        <div className="empty-state">
                            <ShoppingCart className="empty-state-icon" />
                            <p>Hozircha buyurtmalar haqida ma'lumot yo'q</p>
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="card card-padded">
                    <h3 className="section-title">🏆 Top mahsulotlar</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {stats.topProducts.map((p, i) => (
                            <div key={p.productId} className="glass" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 10,
                                    background: i === 0 ? "linear-gradient(135deg, #ffd700, #b8860b)" :
                                        i === 1 ? "linear-gradient(135deg, #c0c0c0, #708090)" :
                                            i === 2 ? "linear-gradient(135deg, #cd7f32, #8b4513)" : "rgba(255,255,255,0.05)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 14, fontWeight: 800, color: i < 3 ? "#000" : "var(--accent-secondary)",
                                    boxShadow: i < 3 ? "0 4px 10px rgba(0,0,0,0.3)" : "none"
                                }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="fw-bold" style={{ fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Sotilgan: {p._sum.quantity} ta</div>
                                </div>
                                <div style={{ width: 40, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${(p._sum.quantity / stats.topProducts[0]._sum.quantity) * 100}%`, background: "var(--accent-success)", borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                        {stats.topProducts.length === 0 && <p className="text-muted" style={{ textAlign: "center", padding: 20 }}>Ma'lumot topilmadi</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
